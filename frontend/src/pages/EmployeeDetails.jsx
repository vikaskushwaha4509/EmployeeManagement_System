import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Building2,
  CalendarCheck,
  CalendarOff,
  Receipt,
  User,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import employeeService from '../services/employeeService';
import attendanceService from '../services/attendanceService';
import leaveService from '../services/leaveService';
import payrollService from '../services/payrollService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [employee, setEmployee] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const empData = await employeeService.getEmployeeById(id);
      setEmployee(empData);

      const [allAtt, allLeaves, allPayrolls] = await Promise.allSettled([
        attendanceService.getAllAttendance(),
        leaveService.getAllLeaves(),
        payrollService.getAllPayrolls(),
      ]);

      if (allAtt.status === 'fulfilled') {
        setAttendances(
          (allAtt.value || []).filter((a) => String(a.employeeId) === String(id))
        );
      }
      if (allLeaves.status === 'fulfilled') {
        setLeaves(
          (allLeaves.value || []).filter((l) => String(l.employeeId) === String(id))
        );
      }
      if (allPayrolls.status === 'fulfilled') {
        setPayrolls(
          (allPayrolls.value || []).filter((p) => String(p.employeeId) === String(id))
        );
      }
    } catch (err) {
      console.error('Failed to load employee details:', err);
      if (err.status === 404) {
        setNotFound(true);
      } else {
        toastError('Failed to load employee details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeService.deleteEmployee(id);
      success('Employee deleted successfully.');
      navigate('/employees');
    } catch (err) {
      toastError(err.message || 'Failed to delete employee.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-slate-200 rounded-xl">
        <Loader text="Loading employee profile..." />
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-slate-800">Employee Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          The requested employee record does not exist or has been removed.
        </p>
        <Link
          to="/employees"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Back to Employees"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Employee ID: #{employee.id} &bull; {employee.designation || 'Staff'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Edit2}
            onClick={() => navigate(`/employees/${id}/edit`)}
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center mb-4">
            {(employee.firstName?.[0] || 'E') + (employee.lastName?.[0] || '')}
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            {employee.firstName} {employee.lastName}
          </h2>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mt-1.5">
            {employee.designation || 'Staff'}
          </span>

          <div className="w-full border-t border-slate-100 mt-6 pt-5 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{employee.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{employee.departmentName || 'General Department'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Joined: {employee.joiningDate || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900">{formatCurrency(employee.salary)} / mo</span>
            </div>
          </div>
        </div>

        {/* History Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance History */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" /> Recent Attendance
              </h3>
              <Link to="/attendance" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {attendances.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No attendance logs found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendances.slice(-3).reverse().map((att) => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{att.attendanceDate}</span>
                    <Badge status={att.status} />
                    <span className="text-slate-500">{att.checkInTime} - {att.checkOutTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave History */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-amber-600" /> Leave History
              </h3>
              <Link to="/leaves" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {leaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No leave requests found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {leaves.slice(-3).reverse().map((leave) => (
                  <div key={leave.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-slate-800">{leave.startDate} to {leave.endDate}</span>
                      <p className="text-slate-500 mt-0.5">{leave.reason}</p>
                    </div>
                    <Badge status={leave.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payroll History */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" /> Payroll History
              </h3>
              <Link to="/payroll" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {payrolls.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No payroll logs found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {payrolls.slice(-3).reverse().map((pay) => (
                  <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{pay.month} {pay.year}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(pay.netSalary)}</span>
                    <span className="text-slate-500">{pay.paymentDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This will also remove associated records.`}
        confirmLabel="Delete Employee"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default EmployeeDetails;
