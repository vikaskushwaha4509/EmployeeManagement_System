import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';

export const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const fetchEmployeesAndDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empData, deptData] = await Promise.all([
        employeeService.getAllEmployees(),
        departmentService.getAllDepartments().catch(() => []),
      ]);
      setEmployees(empData || []);
      setDepartments(deptData || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployeesAndDepartments();
  }, [fetchEmployeesAndDepartments]);

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);
    try {
      await employeeService.deleteEmployee(employeeToDelete.id);
      success(`Employee ${employeeToDelete.firstName} ${employeeToDelete.lastName} was deleted.`);
      setEmployeeToDelete(null);
      fetchEmployeesAndDepartments();
    } catch (err) {
      toastError(err.message || 'Failed to delete employee.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const designation = (emp.designation || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        fullName.includes(term) || email.includes(term) || designation.includes(term);

      const matchesDept =
        !selectedDepartment ||
        emp.departmentId === Number(selectedDepartment) ||
        emp.departmentName === selectedDepartment;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDepartment]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
            {(row.firstName?.[0] || 'E') + (row.lastName?.[0] || '')}
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{row.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'departmentName',
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          <Building className="w-3 h-3 text-slate-400" />
          {row.departmentName || 'General'}
        </span>
      ),
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (row) => (
        <span className="text-sm text-slate-700 font-medium">{row.designation || 'N/A'}</span>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Phone className="w-3 h-3 text-slate-400" />
          {row.phone || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Salary',
      accessor: 'salary',
      render: (row) => (
        <span className="text-sm font-semibold text-slate-800">
          {formatCurrency(row.salary)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/employees/${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/employees/${row.id}/edit`)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEmployeeToDelete(row)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Employees</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your employee directory and records
          </p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => navigate('/employees/add')}
        >
          Add Employee
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
            placeholder="Search by name, email, role..."
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={paginatedEmployees}
          loading={loading}
          emptyMessage="No employees found."
        />

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredEmployees.length)} of{' '}
              {filteredEmployees.length} employees
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(employeeToDelete)}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setEmployeeToDelete(null)}
      />
    </div>
  );
};

export default Employees;
