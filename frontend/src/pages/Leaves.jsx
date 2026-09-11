import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarOff,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Clock,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import leaveService from '../services/leaveService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { LeaveStatus, LEAVE_STATUS_OPTIONS } from '../constants/enums';
import PageHeader from '../components/common/PageHeader';
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
  const { isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Apply/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    employeeId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating state per row
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leaveData, empData] = await Promise.all([
        leaveService.getAllLeaves(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setLeaves(leaveData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error loading leaves:', err);
      setError(err.message || 'Failed to load leave records from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingLeave(null);
    setFormData({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
      employeeId: employees.length > 0 ? String(employees[0].id) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingLeave(item);
    setFormData({
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      reason: item.reason || '',
      employeeId: item.employeeId ? String(item.employeeId) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    if (!isAdmin) {
      toastError('Only administrators can approve or reject leave requests.');
      return;
    }

    setUpdatingStatusId(leaveId);
    try {
      await leaveService.updateLeaveStatus(leaveId, newStatus);
      success(`Leave request status updated to ${newStatus}.`);
      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      toastError(err.message || 'Failed to update leave status.');
    } finally {
      setUpdatingStatusId(null);
    }
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
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
        employeeId: Number(formData.employeeId),
      };

      if (editingLeave) {
        await leaveService.updateLeave(editingLeave.id, payload);
        success('Leave request updated.');
      } else {
        await leaveService.createLeave(payload);
        success('Leave request submitted for review.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leaveToDelete) return;
    if (!isAdmin) {
      toastError('Only administrators can delete leave entries.');
      setLeaveToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      await leaveService.deleteLeave(leaveToDelete.id);
      success('Leave record removed.');
      setLeaveToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete leave record.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const name = (l.employeeName || '').toLowerCase();
      const reason = (l.reason || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || reason.includes(term) || String(l.employeeId).includes(term);
      const matchesStatus = !statusFilter || l.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, searchTerm, statusFilter]);

  // Paginated
  const totalPages = Math.ceil(filteredLeaves.length / pageSize) || 1;
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeaves.slice(start, start + pageSize);
  }, [filteredLeaves, currentPage, pageSize]);

  const getStatusBadge = (status) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return <Badge variant="emerald" dot size="sm">Approved</Badge>;
      case LeaveStatus.REJECTED:
        return <Badge variant="rose" dot size="sm">Rejected</Badge>;
      case LeaveStatus.PENDING:
      default:
        return <Badge variant="amber" dot size="sm">Pending</Badge>;
    }
  };

  const columns = [
    {
      header: 'Staff Member',
      key: 'employee',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {row.employeeName || `Employee #${row.employeeId}`}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">ID: #{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Duration Period',
      key: 'dates',
      render: (row) => (
        <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {row.startDate} &rarr; {row.endDate}
          </span>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <span className="text-xs text-slate-300 max-w-xs truncate block" title={row.reason}>
          {row.reason || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Admin Decision',
      key: 'approval',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {isAdmin ? (
            row.status === LeaveStatus.PENDING ? (
              <>
                <button
                  disabled={updatingStatusId === row.id}
                  onClick={() => handleStatusChange(row.id, LeaveStatus.APPROVED)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg border border-emerald-500/30 transition-all disabled:opacity-50"
                  title="Approve Leave"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Approve</span>
                </button>
                <button
                  disabled={updatingStatusId === row.id}
                  onClick={() => handleStatusChange(row.id, LeaveStatus.REJECTED)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 rounded-lg border border-rose-500/30 transition-all disabled:opacity-50"
                  title="Reject Leave"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reject</span>
                </button>
              </>
            ) : (
              <button
                disabled={updatingStatusId === row.id}
                onClick={() => handleStatusChange(row.id, LeaveStatus.PENDING)}
                className="text-[11px] font-semibold text-slate-400 hover:text-white underline disabled:opacity-50"
                title="Reset to Pending"
              >
                Reset Status
              </button>
            )
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              {row.status === LeaveStatus.PENDING ? 'Awaiting Admin Review' : 'Decision Finalized'}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 transition-all"
            title="Edit Leave Request"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setLeaveToDelete(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
              title="Delete Record (Admin)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      <PageHeader
        title="Leave Approvals & Requests"
        description="Review time-off submissions, execute executive approvals via Spring Boot API, and monitor absence"
        action={
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Submit Leave
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search by staff member or reason..."
          className="w-full md:max-w-xs"
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="" className="bg-slate-900 text-white">All Statuses</option>
            {LEAVE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* Leaves Table */}
      <Table
        columns={columns}
        data={paginatedLeaves}
        isLoading={loading}
        emptyMessage="No leave requests found"
        emptyDescription={
          searchTerm || statusFilter
            ? 'No leave records match your filter criteria.'
            : 'No leaves requested yet.'
        }
        emptyActionLabel={!searchTerm && !statusFilter ? 'Submit Leave Request' : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      {/* Pagination */}
      {!loading && filteredLeaves.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLeaves.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLeave ? 'Edit Leave Application' : 'Submit Leave Application'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Staff Member"
            required
            value={formData.employeeId}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, employeeId: e.target.value }));
              if (formErrors.employeeId) setFormErrors((prev) => ({ ...prev, employeeId: null }));
            }}
            options={employees.map((emp) => ({
              value: String(emp.id),
              label: `${emp.firstName} ${emp.lastName} (${emp.designation})`,
            }))}
            placeholder="Select staff member"
            error={formErrors.employeeId}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, startDate: e.target.value }));
                if (formErrors.startDate) setFormErrors((prev) => ({ ...prev, startDate: null }));
              }}
              error={formErrors.startDate}
            />

            <Input
              label="End Date"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, endDate: e.target.value }));
                if (formErrors.endDate) setFormErrors((prev) => ({ ...prev, endDate: null }));
              }}
              error={formErrors.endDate}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Reason for Absence
            </label>
            <textarea
              rows={3}
              placeholder="State the justification for this leave request..."
              value={formData.reason}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, reason: e.target.value }));
                if (formErrors.reason) setFormErrors((prev) => ({ ...prev, reason: null }));
              }}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-white bg-slate-950/80 border border-white/10 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-500"
            />
            {formErrors.reason && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{formErrors.reason}</p>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingLeave ? 'Update Leave' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(leaveToDelete)}
        onClose={() => setLeaveToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Revoke Leave Application"
        message={`Are you sure you want to permanently delete the leave request for ${leaveToDelete?.employeeName}?`}
        confirmText="Confirm Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default Leaves;
