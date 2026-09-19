import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { AttendanceStatus, ATTENDANCE_STATUS_OPTIONS } from '../constants/enums';
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
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [attData, empData] = await Promise.all([
        attendanceService.getAllAttendance(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setAttendanceList(attData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error loading attendance:', err);
      toastError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      attendanceDate: new Date().toISOString().split('T')[0],
      status: AttendanceStatus.PRESENT,
      checkInTime: '09:00 AM',
      checkOutTime: '05:00 PM',
      employeeId: employees[0]?.id ? String(employees[0].id) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      attendanceDate: item.attendanceDate || '',
      status: item.status || AttendanceStatus.PRESENT,
      checkInTime: item.checkInTime || '',
      checkOutTime: item.checkOutTime || '',
      employeeId: item.employeeId ? String(item.employeeId) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.attendanceDate) errs.attendanceDate = 'Attendance date is required.';
    if (!formData.employeeId) errs.employeeId = 'Please select an employee.';
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
        checkInTime: formData.checkInTime.trim(),
        checkOutTime: formData.checkOutTime.trim(),
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

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await attendanceService.deleteAttendance(itemToDelete.id);
      success('Attendance record deleted.');
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete record.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    return attendanceList.filter((item) => {
      const name = (item.employeeName || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch = name.includes(term) || String(item.employeeId).includes(term);
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesDate = !dateFilter || item.attendanceDate === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [attendanceList, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredAttendance.length / pageSize) || 1;
  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAttendance.slice(start, start + pageSize);
  }, [filteredAttendance, currentPage, pageSize]);

  const columns = [
    {
      header: 'Date',
      accessor: 'attendanceDate',
      render: (row) => (
        <span className="text-sm font-semibold text-slate-800">
          {row.attendanceDate}
        </span>
      ),
    },
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
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Check-In',
      accessor: 'checkInTime',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.checkInTime || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Check-Out',
      accessor: 'checkOutTime',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.checkOutTime || 'N/A'}
        </span>
      ),
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
            onClick={() => setItemToDelete(row)}
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
    label: `${emp.firstName} ${emp.lastName} (${emp.email})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Attendance</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track daily attendance and clock-in logs
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAdd}
        >
          Mark Attendance
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search employee..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {(searchTerm || statusFilter || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
                setCurrentPage(1);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={paginatedAttendance}
          loading={loading}
          emptyMessage="No attendance records found."
        />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredAttendance.length)} of{' '}
              {filteredAttendance.length} records
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Attendance' : 'Mark Attendance'}
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

          <Input
            label="Date"
            type="date"
            value={formData.attendanceDate}
            onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
            error={formErrors.attendanceDate}
            required
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={ATTENDANCE_STATUS_OPTIONS}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Check-In Time"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
              placeholder="09:00 AM"
            />
            <Input
              label="Check-Out Time"
              value={formData.checkOutTime}
              onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
              placeholder="05:00 PM"
            />
          </div>

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
              {editingItem ? 'Save Record' : 'Record Attendance'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance log?"
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default Attendance;
