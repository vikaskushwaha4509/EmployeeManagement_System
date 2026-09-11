import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  Filter,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Table from '../components/common/Table';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';

export const Employees = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, filter & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Deletion state
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
      setError(err.message || 'Failed to fetch employees from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployeesAndDepartments();
  }, [fetchEmployeesAndDepartments]);

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    if (!isAdmin) {
      toastError('Unauthorized: Only administrators can delete employee records.');
      setEmployeeToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      await employeeService.deleteEmployee(employeeToDelete.id);
      success(`Employee ${employeeToDelete.firstName} ${employeeToDelete.lastName} was deleted successfully.`);
      setEmployeeToDelete(null);
      fetchEmployeesAndDepartments();
    } catch (err) {
      toastError(err.message || 'Failed to delete employee. Ensure no dependent records exist.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered employees
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

  // Paginated items
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

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
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
            {row.firstName?.[0]}
            {row.lastName?.[0]}
          </div>
          <div>
            <div className="font-bold text-white text-xs sm:text-sm">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{row.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'department',
      render: (row) => (
        <Badge variant="indigo" dot size="sm">
          {row.departmentName || `Dept #${row.departmentId || 'Unassigned'}`}
        </Badge>
      ),
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (row) => (
        <span className="text-xs text-slate-300 font-semibold">{row.designation || 'N/A'}</span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'phone',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Phone className="w-3 h-3 text-slate-500" />
          {row.phone || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Compensation',
      accessor: 'salary',
      render: (row) => (
        <span className="font-bold text-emerald-400 text-xs font-mono">
          {formatCurrency(row.salary)}
        </span>
      ),
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          {row.joiningDate || 'N/A'}
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
          <button
            onClick={() => navigate(`/employees/${row.id}`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 transition-all"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/employees/${row.id}/edit`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 transition-all"
            title="Edit Employee"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setEmployeeToDelete(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all"
              title="Delete Employee (Admin)"
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
        title="Employee Directory"
        description="Comprehensive employee roster, department assignment, and compensation administration"
        action={
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Admin Management
              </span>
            )}
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => navigate('/employees/add')}
            >
              Add Staff
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search staff by name, email, or role..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-52 px-3.5 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="" className="bg-slate-900 text-white">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={fetchEmployeesAndDepartments}>
            Retry
          </Button>
        </div>
      )}

      {/* Employee Table */}
      <Table
        columns={columns}
        data={paginatedEmployees}
        isLoading={loading}
        emptyMessage="No staff records identified"
        emptyDescription={
          searchTerm || selectedDepartment
            ? 'No employees match the active filters. Adjust your search criteria.'
            : 'No employees have been registered in the database yet.'
        }
        emptyActionLabel={!searchTerm && !selectedDepartment ? 'Add First Employee' : undefined}
        onEmptyAction={() => navigate('/employees/add')}
      />

      {/* Pagination */}
      {!loading && filteredEmployees.length > 0 && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredEmployees.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Employee Termination"
        message={`Are you sure you want to permanently delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This action requires administrator authority and will purge all linked records.`}
        confirmText="Confirm Delete"
        isLoading={deleting}
      />
    </div>
  );
};

export default Employees;
