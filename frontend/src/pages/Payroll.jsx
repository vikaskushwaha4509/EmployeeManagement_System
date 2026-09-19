import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import payrollService from '../services/payrollService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { MONTHS } from '../constants/enums';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';

export const Payroll = () => {
  const currentDate = new Date();
  const currentMonthName = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    month: currentMonthName,
    year: currentYear,
    basicSalary: '',
    allowance: '0',
    deductions: '0',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [payrollData, empData] = await Promise.all([
        payrollService.getAllPayrolls(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setPayrolls(payrollData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error loading payrolls:', err);
      toastError('Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingPayroll(null);
    const initialEmp = employees[0];
    setFormData({
      employeeId: initialEmp?.id ? String(initialEmp.id) : '',
      month: currentMonthName,
      year: currentYear,
      basicSalary: initialEmp?.salary ? String(initialEmp.salary) : '50000',
      allowance: '5000',
      deductions: '2000',
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      employeeId: payroll.employeeId ? String(payroll.employeeId) : '',
      month: payroll.month || currentMonthName,
      year: payroll.year || currentYear,
      basicSalary: String(payroll.basicSalary ?? ''),
      allowance: String(payroll.allowance ?? payroll.bonus ?? '0'),
      deductions: String(payroll.deductions ?? payroll.deduction ?? '0'),
      paymentDate: payroll.paymentDate || new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEmployeeSelect = (empId) => {
    const emp = employees.find((e) => String(e.id) === empId);
    setFormData((prev) => ({
      ...prev,
      employeeId: empId,
      basicSalary: emp?.salary ? String(emp.salary) : prev.basicSalary,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.employeeId) errs.employeeId = 'Employee selection is required.';
    if (!formData.year || isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > 2100) {
      errs.year = 'Please enter a valid 4-digit year (e.g. 2026).';
    }
    if (!formData.basicSalary || isNaN(Number(formData.basicSalary)) || Number(formData.basicSalary) < 0) {
      errs.basicSalary = 'Basic salary must be a valid positive number.';
    }
    if (isNaN(Number(formData.allowance)) || Number(formData.allowance) < 0) {
      errs.allowance = 'Allowance must be a valid positive number.';
    }
    if (isNaN(Number(formData.deductions)) || Number(formData.deductions) < 0) {
      errs.deductions = 'Deductions must be a valid positive number.';
    }
    if (!formData.paymentDate) errs.paymentDate = 'Payment date is required.';
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
        month: formData.month,
        year: Number(formData.year),
        basicSalary: Number(formData.basicSalary),
        bonus: Number(formData.allowance || 0),
        deduction: Number(formData.deductions || 0),
        allowance: Number(formData.allowance || 0),
        deductions: Number(formData.deductions || 0),
        paymentDate: formData.paymentDate,
      };

      if (editingPayroll) {
        await payrollService.updatePayroll(editingPayroll.id, payload);
        success('Payroll entry updated successfully.');
      } else {
        await payrollService.createPayroll(payload);
        success('Payroll entry created successfully.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save payroll entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!payrollToDelete) return;
    setDeleting(true);
    try {
      await payrollService.deletePayroll(payrollToDelete.id);
      success('Payroll entry deleted.');
      setPayrollToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete payroll entry.');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((item) => {
      const name = (item.employeeName || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch = name.includes(term) || String(item.employeeId).includes(term);
      const matchesMonth = !monthFilter || item.month === monthFilter;
      const matchesYear = !yearFilter || String(item.year).includes(yearFilter.trim());
      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [payrolls, searchTerm, monthFilter, yearFilter]);

  const totalPages = Math.ceil(filteredPayrolls.length / pageSize) || 1;
  const paginatedPayrolls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayrolls.slice(start, start + pageSize);
  }, [filteredPayrolls, currentPage, pageSize]);

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
      header: 'Pay Period',
      accessor: 'period',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {row.month} {row.year}
        </span>
      ),
    },
    {
      header: 'Basic Salary',
      accessor: 'basicSalary',
      render: (row) => (
        <span className="text-sm text-slate-700">{formatCurrency(row.basicSalary)}</span>
      ),
    },
    {
      header: 'Allowance / Bonus',
      accessor: 'allowance',
      render: (row) => (
        <span className="text-sm text-emerald-600">
          +{formatCurrency(row.allowance ?? row.bonus ?? 0)}
        </span>
      ),
    },
    {
      header: 'Deductions',
      accessor: 'deductions',
      render: (row) => (
        <span className="text-sm text-rose-600">
          -{formatCurrency(row.deductions ?? row.deduction ?? 0)}
        </span>
      ),
    },
    {
      header: 'Net Salary',
      accessor: 'netSalary',
      render: (row) => {
        const basic = Number(row.basicSalary || 0);
        const bonus = Number(row.allowance ?? row.bonus ?? 0);
        const ded = Number(row.deductions ?? row.deduction ?? 0);
        const net = row.netSalary ?? (basic + bonus - ded);
        return (
          <span className="text-sm font-bold text-slate-900">
            {formatCurrency(net)}
          </span>
        );
      },
    },
    {
      header: 'Payment Date',
      accessor: 'paymentDate',
      render: (row) => (
        <span className="text-xs text-slate-500">{row.paymentDate || 'N/A'}</span>
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
            onClick={() => setPayrollToDelete(row)}
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
    label: `${emp.firstName} ${emp.lastName} (${emp.designation || 'Staff'})`,
  }));

  const monthOptions = MONTHS.map((m) => ({ value: m, label: m }));

  const calculatedNet =
    Number(formData.basicSalary || 0) +
    Number(formData.allowance || 0) -
    Number(formData.deductions || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Payroll Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage employee compensation and payroll records
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAdd}
        >
          Generate Payroll
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
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Manually Editable Year Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter Year (e.g. 2026)"
              className="w-40 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {(searchTerm || monthFilter || yearFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setMonthFilter('');
                setYearFilter('');
                setCurrentPage(1);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={paginatedPayrolls}
          loading={loading}
          emptyMessage="No payroll records found."
        />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredPayrolls.length)} of{' '}
              {filteredPayrolls.length} records
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
        title={editingPayroll ? 'Edit Payroll Record' : 'Generate Payroll Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Employee"
            value={formData.employeeId}
            onChange={(e) => handleEmployeeSelect(e.target.value)}
            options={employeeOptions}
            error={formErrors.employeeId}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              options={monthOptions}
              required
            />

            {/* Manually Editable Year Input */}
            <Input
              label="Year (Custom Input)"
              type="number"
              placeholder="e.g. 2026"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              error={formErrors.year}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Basic Salary (₹)"
              type="number"
              value={formData.basicSalary}
              onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
              error={formErrors.basicSalary}
              required
            />
            <Input
              label="Allowance / Bonus (₹)"
              type="number"
              value={formData.allowance}
              onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
              error={formErrors.allowance}
            />
            <Input
              label="Deductions (₹)"
              type="number"
              value={formData.deductions}
              onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              error={formErrors.deductions}
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">Calculated Net Salary:</span>
            <span className="font-bold text-slate-900 text-base">{formatCurrency(calculatedNet)}</span>
          </div>

          <Input
            label="Payment Date"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            error={formErrors.paymentDate}
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
              {editingPayroll ? 'Save Payroll' : 'Generate Payroll'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(payrollToDelete)}
        title="Delete Payroll Record"
        message="Are you sure you want to delete this payroll record?"
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPayrollToDelete(null)}
      />
    </div>
  );
};

export default Payroll;
