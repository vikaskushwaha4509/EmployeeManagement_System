import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarOff,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import leaveService from '../services/leaveService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { LeaveStatus, LEAVE_STATUS_OPTIONS } from '../constants/enums';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';

export const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: LeaveStatus.PENDING,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leaveData, empData] = await Promise.all([
        leaveService.getAllLeaves(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setLeaves(leaveData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error loading leaves:', err);
      toastError('Failed to load leave records.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingLeave(null);
    setFormData({
      employeeId: employees[0]?.id ? String(employees[0].id) : '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
      status: LeaveStatus.PENDING,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (leave) => {
    setEditingLeave(leave);
    setFormData({
      employeeId: leave.employeeId ? String(leave.employeeId) : '',
      startDate: leave.startDate || '',
      endDate: leave.endDate || '',
      reason: leave.reason || '',
      status: leave.status || LeaveStatus.PENDING,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.employeeId) errs.employeeId = 'Employee selection is required.';
    if (!formData.startDate) errs.startDate = 'Start date is required.';
    if (!formData.endDate) errs.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errs.endDate = 'End date cannot be earlier than start date.';
    }
    if (!formData.reason.trim()) errs.reason = 'Reason for leave is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        employeeId: Number(formData.employeeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
        status: formData.status,
      };

      if (editingLeave) {
        await leaveService.updateLeave(editingLeave.id, payload);
        success('Leave request updated.');
      } else {
        await leaveService.createLeave(payload);
        success('Leave request submitted.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      // Optimistic update
      setLeaves((prev) =>
        prev.map((item) => (item.id === leaveId ? { ...item, status: newStatus } : item))
      );
      await leaveService.updateLeaveStatus(leaveId, newStatus);
      success(`Leave status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to update status.');
      loadData();
    }
  };

  const handleDelete = async () => {
    if (!leaveToDelete) return;
    setDeleting(true);
    try {
      await leaveService.deleteLeave(leaveToDelete.id);
      success('Leave request deleted.');
      setLeaveToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete leave request.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const name = (item.employeeName || '').toLowerCase();
      const reason = (item.reason || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch = name.includes(term) || reason.includes(term);
      const matchesTab = activeTab === 'ALL' || item.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [leaves, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredLeaves.length / pageSize) || 1;
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeaves.slice(start, start + pageSize);
  }, [filteredLeaves, currentPage, pageSize]);

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <div className="font-semibold text-sm text-slate-800">
            {row.employeeName || `Employee #${row.employeeId}`}
          </div>
          <div className="text-xs text-slate-500">ID: {row.employeeId}</div>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">
            {row.startDate} to {row.endDate}
          </div>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <span className="text-sm text-slate-600 max-w-xs truncate block">
          {row.reason || 'No reason specified'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Decision',
      accessor: 'decision',
      render: (row) => {
        if (row.status === 'PENDING') {
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStatusChange(row.id, 'APPROVED')}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => handleStatusChange(row.id, 'REJECTED')}
                className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          );
        }
        return <span className="text-xs text-slate-400">Processed</span>;
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLeaveToDelete(row)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const employeeOptions = employees.map((emp) => ({
    value: String(emp.id),
    label: `${emp.firstName} ${emp.lastName}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and manage employee leave requests
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAdd}
        >
          New Leave Request
        </Button>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search by name or reason..."
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={paginatedLeaves}
          loading={loading}
          emptyMessage="No leave requests found."
        />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredLeaves.length)} of{' '}
              {filteredLeaves.length} requests
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLeave ? 'Edit Leave Request' : 'New Leave Request'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Employee"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            options={employeeOptions}
            error={formErrors.employeeId}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              error={formErrors.startDate}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              error={formErrors.endDate}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Annual vacation, medical appointment..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
            {formErrors.reason && (
              <p className="mt-1 text-xs text-red-600">{formErrors.reason}</p>
            )}
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={LEAVE_STATUS_OPTIONS}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {editingLeave ? 'Save Changes' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(leaveToDelete)}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request?"
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setLeaveToDelete(null)}
      />
    </div>
  );
};

export default Leaves;
