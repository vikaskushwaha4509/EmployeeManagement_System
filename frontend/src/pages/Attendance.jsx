import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  Filter,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { AttendanceStatus, ATTENDANCE_STATUS_OPTIONS } from '../constants/enums';
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

export const Attendance = () => {
  const { isAdmin } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    attendanceDate: new Date().toISOString().split('T')[0],
    status: AttendanceStatus.PRESENT,
    checkInTime: '09:00 AM',
    checkOutTime: '05:00 PM',
    employeeId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [attData, empData] = await Promise.all([
        attendanceService.getAllAttendance(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setAttendanceList(attData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      attendanceDate: new Date().toISOString().split('T')[0],
      status: AttendanceStatus.PRESENT,
      checkInTime: '09:00 AM',
      checkOutTime: '05:00 PM',
      employeeId: employees.length > 0 ? String(employees[0].id) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (att) => {
    setEditingItem(att);
    setFormData({
      attendanceDate: att.attendanceDate || '',
      status: att.status || AttendanceStatus.PRESENT,
      checkInTime: att.checkInTime || '',
      checkOutTime: att.checkOutTime || '',
      employeeId: att.employeeId ? String(att.employeeId) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.employeeId) errs.employeeId = 'Employee selection is required.';
    if (!formData.attendanceDate) errs.attendanceDate = 'Attendance date is required.';
    if (!formData.status) errs.status = 'Status is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        attendanceDate: formData.attendanceDate,
        status: formData.status,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        employeeId: Number(formData.employeeId),
      };

      if (editingItem) {
        await attendanceService.updateAttendance(editingItem.id, payload);
        success('Attendance record updated successfully.');
      } else {
        await attendanceService.createAttendance(payload);
        success('Attendance record logged successfully.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save attendance record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    if (!isAdmin) {
      toastError('Only administrators can delete attendance records.');
      setItemToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      await attendanceService.deleteAttendance(itemToDelete.id);
      success('Attendance record deleted.');
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete attendance record.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered attendance list
  const filteredList = useMemo(() => {
    return attendanceList.filter((item) => {
      const empName = (item.employeeName || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch = empName.includes(term) || String(item.employeeId).includes(term);

      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesDate = !dateFilter || item.attendanceDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [attendanceList, searchTerm, statusFilter, dateFilter]);

  // Paginated
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const getStatusBadge = (status) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <Badge variant="emerald" dot size="sm">Present</Badge>;
      case AttendanceStatus.ABSENT:
        return <Badge variant="rose" dot size="sm">Absent</Badge>;
      case AttendanceStatus.HALF_DAY:
        return <Badge variant="amber" dot size="sm">Half Day</Badge>;
      case AttendanceStatus.LEAVE:
        return <Badge variant="blue" dot size="sm">Leave</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'attendanceDate',
      cellClassName: 'text-xs font-bold text-white font-mono',
    },
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
      header: 'Status',
      key: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Check In',
      accessor: 'checkInTime',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.checkInTime || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Check Out',
      accessor: 'checkOutTime',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.checkOutTime || '—'}</span>
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
            title="Edit Attendance"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setItemToDelete(row)}
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
        title="Attendance Ledger"
        description="Monitor staff presence, log daily check-in / check-out timestamps, and review audit records"
        action={
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Log Attendance
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
          placeholder="Search by staff name or ID..."
          className="w-full md:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="" className="bg-slate-900 text-white">All Statuses</option>
            {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {(searchTerm || statusFilter || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
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

      {/* Attendance Table */}
      <Table
        columns={columns}
        data={paginatedList}
        isLoading={loading}
        emptyMessage="No attendance records identified"
        emptyDescription={
          searchTerm || statusFilter || dateFilter
            ? 'No attendance records match your filter criteria.'
            : 'No attendance records logged in the system yet.'
        }
        emptyActionLabel={
          !searchTerm && !statusFilter && !dateFilter ? 'Log Today Attendance' : undefined
        }
        onEmptyAction={handleOpenAddModal}
      />

      {/* Pagination */}
      {!loading && filteredList.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredList.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Add / Edit Attendance Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Attendance Entry' : 'Log Staff Attendance'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Staff Member"
            required
            value={formData.employeeId}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, employeeId: e.target.value }));
              if (formErrors.employeeId) {
                setFormErrors((prev) => ({ ...prev, employeeId: null }));
              }
            }}
            options={employees.map((emp) => ({
              value: String(emp.id),
              label: `${emp.firstName} ${emp.lastName} (${emp.designation})`,
            }))}
            placeholder="Select staff member"
            error={formErrors.employeeId}
          />

          <Input
            label="Attendance Date"
            type="date"
            required
            value={formData.attendanceDate}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, attendanceDate: e.target.value }));
              if (formErrors.attendanceDate) {
                setFormErrors((prev) => ({ ...prev, attendanceDate: null }));
              }
            }}
            error={formErrors.attendanceDate}
          />

          <Select
            label="Attendance Status"
            required
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            options={ATTENDANCE_STATUS_OPTIONS}
            error={formErrors.status}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Check-in Time"
              placeholder="e.g. 09:00 AM"
              value={formData.checkInTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, checkInTime: e.target.value }))
              }
            />

            <Input
              label="Check-out Time"
              placeholder="e.g. 05:00 PM"
              value={formData.checkOutTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, checkOutTime: e.target.value }))
              }
            />
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
              {editingItem ? 'Save Changes' : 'Log Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Revoke Attendance Log"
        message={`Are you sure you want to delete the attendance record for ${itemToDelete?.employeeName} on ${itemToDelete?.attendanceDate}?`}
        confirmText="Confirm Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default Attendance;
