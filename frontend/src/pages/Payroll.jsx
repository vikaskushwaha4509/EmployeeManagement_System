import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Receipt,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  DollarSign,
  User,
  Calculator,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import payrollService from '../services/payrollService';
import employeeService from '../services/employeeService';
import { useToast } from '../context/ToastContext';
import { MONTHS } from '../constants/enums';
import PageHeader from '../components/common/PageHeader';
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

  const { isAdmin } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [formData, setFormData] = useState({
    month: currentMonthName,
    year: currentYear,
    basicSalary: '',
    bonus: '0',
    deduction: '0',
    employeeId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [payrollData, empData] = await Promise.all([
        payrollService.getAllPayrolls(),
        employeeService.getAllEmployees().catch(() => []),
      ]);
      setPayrolls(payrollData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error('Error loading payrolls:', err);
      setError(err.message || 'Failed to load payroll records from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      toastError('Only administrators can generate payroll statements.');
      return;
    }
    setEditingPayroll(null);
    const firstEmp = employees[0];
    setFormData({
      month: currentMonthName,
      year: currentYear,
      basicSalary: firstEmp ? String(firstEmp.salary || '') : '',
      bonus: '0',
      deduction: '0',
      employeeId: firstEmp ? String(firstEmp.id) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    if (!isAdmin) {
      toastError('Only administrators can modify payroll statements.');
      return;
    }
    setEditingPayroll(item);
    setFormData({
      month: item.month || currentMonthName,
      year: item.year || currentYear,
      basicSalary: item.basicSalary !== undefined ? String(item.basicSalary) : '',
      bonus: item.bonus !== undefined ? String(item.bonus) : '0',
      deduction: item.deduction !== undefined ? String(item.deduction) : '0',
      employeeId: item.employeeId ? String(item.employeeId) : '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEmployeeSelect = (empId) => {
    const selectedEmp = employees.find((e) => String(e.id) === String(empId));
    setFormData((prev) => ({
      ...prev,
      employeeId: empId,
      basicSalary: selectedEmp?.salary ? String(selectedEmp.salary) : prev.basicSalary,
    }));
    if (formErrors.employeeId) {
      setFormErrors((prev) => ({ ...prev, employeeId: null }));
    }
  };

  const calculatedNetSalary = useMemo(() => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const ded = parseFloat(formData.deduction) || 0;
    return Math.max(0, basic + bonus - ded);
  }, [formData.basicSalary, formData.bonus, formData.deduction]);

  const validate = () => {
    const errs = {};
    if (!formData.employeeId) errs.employeeId = 'Employee selection is required.';
    if (!formData.month) errs.month = 'Month is required.';
    if (!formData.year || isNaN(Number(formData.year))) errs.year = 'Valid year is required.';
    if (formData.basicSalary === '' || isNaN(Number(formData.basicSalary)) || Number(formData.basicSalary) < 0) {
      errs.basicSalary = 'Basic salary must be a positive number.';
    }
    if (formData.bonus === '' || isNaN(Number(formData.bonus)) || Number(formData.bonus) < 0) {
      errs.bonus = 'Bonus must be 0 or positive.';
    }
    if (formData.deduction === '' || isNaN(Number(formData.deduction)) || Number(formData.deduction) < 0) {
      errs.deduction = 'Deduction must be 0 or positive.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        month: formData.month,
        year: Number(formData.year),
        basicSalary: Number(formData.basicSalary),
        bonus: Number(formData.bonus),
        deduction: Number(formData.deduction),
        employeeId: Number(formData.employeeId),
      };

      if (editingPayroll) {
        await payrollService.updatePayroll(editingPayroll.id, payload);
        success('Payroll statement updated.');
      } else {
        await payrollService.createPayroll(payload);
        success('Payroll statement generated successfully.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to save payroll record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!payrollToDelete) return;
    if (!isAdmin) {
      toastError('Only administrators can delete payroll statements.');
      setPayrollToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      await payrollService.deletePayroll(payrollToDelete.id);
      success('Payroll record deleted.');
      setPayrollToDelete(null);
      loadData();
    } catch (err) {
      toastError(err.message || 'Failed to delete payroll record.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Payroll
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((p) => {
      const name = (p.employeeName || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || String(p.employeeId).includes(term);
      const matchesMonth = !monthFilter || p.month === monthFilter;
      const matchesYear = !yearFilter || String(p.year) === String(yearFilter);

      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [payrolls, searchTerm, monthFilter, yearFilter]);

  // Aggregate totals
  const totalNetFiltered = useMemo(() => {
    return filteredPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  }, [filteredPayrolls]);

  // Paginated
  const totalPages = Math.ceil(filteredPayrolls.length / pageSize) || 1;
  const paginatedPayrolls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayrolls.slice(start, start + pageSize);
  }, [filteredPayrolls, currentPage, pageSize]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const columns = [
    {
      header: 'Staff Member',
      key: 'employee',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold">
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
      header: 'Pay Cycle',
      key: 'period',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {row.month} {row.year}
          </span>
        </div>
      ),
    },
    {
      header: 'Base Salary',
      accessor: 'basicSalary',
      render: (row) => (
        <span className="text-xs text-slate-300 font-mono">{formatCurrency(row.basicSalary)}</span>
      ),
    },
    {
      header: 'Bonus Incentive',
      accessor: 'bonus',
      render: (row) => (
        <span className="text-xs text-emerald-400 font-mono font-semibold">
          +{formatCurrency(row.bonus)}
        </span>
      ),
    },
    {
      header: 'Withholdings',
      accessor: 'deduction',
      render: (row) => (
        <span className="text-xs text-rose-400 font-mono font-semibold">
          -{formatCurrency(row.deduction)}
        </span>
      ),
    },
    {
      header: 'Disbursed Net Payout',
      accessor: 'netSalary',
      render: (row) => (
        <span className="text-xs font-black text-white bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-xl font-mono shadow-sm">
          {formatCurrency(row.netSalary)}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {isAdmin ? (
            <>
              <button
                onClick={() => handleOpenEditModal(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 transition-all"
                title="Edit Payroll"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPayrollToDelete(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-500 italic">Admin Protected</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      <PageHeader
        title="Payroll & Compensations"
        description="Process salaries, allocate bonuses, configure withholdings, and disburse compensation statements"
        action={
          isAdmin && (
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              Generate Payroll
            </Button>
          )
        }
      />

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Filtered Payout</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{formatCurrency(totalNetFiltered)}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payroll Records</p>
            <p className="text-2xl font-black text-white mt-0.5">{payrolls.length} statements</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Filtered Statements</p>
            <p className="text-2xl font-black text-white mt-0.5">{filteredPayrolls.length} rows</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search by staff member or ID..."
          className="w-full md:max-w-xs"
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="" className="bg-slate-900 text-white">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-white">
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Year (e.g. 2026)"
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-32 px-3 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {(searchTerm || monthFilter || yearFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setMonthFilter('');
                setYearFilter('');
                setCurrentPage(1);
              }}
            >
              Clear
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

      {/* Payroll Table */}
      <Table
        columns={columns}
        data={paginatedPayrolls}
        isLoading={loading}
        emptyMessage="No payroll records found"
        emptyDescription={
          searchTerm || monthFilter || yearFilter
            ? 'No payroll records match your filter criteria.'
            : 'No payroll records have been generated in the system yet.'
        }
        emptyActionLabel={!searchTerm && !monthFilter && !yearFilter && isAdmin ? 'Generate First Statement' : undefined}
        onEmptyAction={handleOpenAddModal}
      />

      {/* Pagination */}
      {!loading && filteredPayrolls.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPayrolls.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Add / Edit Payroll Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPayroll ? 'Modify Payroll Record' : 'Generate Payroll Statement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Staff Member"
            required
            value={formData.employeeId}
            onChange={(e) => handleEmployeeSelect(e.target.value)}
            options={employees.map((emp) => ({
              value: String(emp.id),
              label: `${emp.firstName} ${emp.lastName} (Salary: $${emp.salary || 0})`,
            }))}
            placeholder="Select staff member"
            error={formErrors.employeeId}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payroll Month"
              required
              value={formData.month}
              onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))}
              options={MONTHS}
              error={formErrors.month}
            />

            <Input
              label="Payroll Year"
              type="number"
              required
              value={formData.year}
              onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
              error={formErrors.year}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Base Salary"
              type="number"
              step="0.01"
              required
              value={formData.basicSalary}
              onChange={(e) => setFormData((prev) => ({ ...prev, basicSalary: e.target.value }))}
              error={formErrors.basicSalary}
            />

            <Input
              label="Bonus"
              type="number"
              step="0.01"
              required
              value={formData.bonus}
              onChange={(e) => setFormData((prev) => ({ ...prev, bonus: e.target.value }))}
              error={formErrors.bonus}
            />

            <Input
              label="Deduction"
              type="number"
              step="0.01"
              required
              value={formData.deduction}
              onChange={(e) => setFormData((prev) => ({ ...prev, deduction: e.target.value }))}
              error={formErrors.deduction}
            />
          </div>

          {/* Dynamic Net Salary Preview */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Calculated Net Disbursement:</span>
            </div>
            <span className="text-base font-black text-emerald-400 font-mono">
              {formatCurrency(calculatedNetSalary)}
            </span>
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
              {editingPayroll ? 'Update Record' : 'Commit Payroll'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(payrollToDelete)}
        onClose={() => setPayrollToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Revoke Payroll Statement"
        message={`Are you sure you want to permanently delete the payroll record for ${payrollToDelete?.employeeName} (${payrollToDelete?.month} ${payrollToDelete?.year})?`}
        confirmText="Confirm Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default Payroll;
