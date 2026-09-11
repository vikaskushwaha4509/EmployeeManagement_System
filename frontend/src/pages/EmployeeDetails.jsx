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
  AlertCircle,
  CalendarCheck,
  CalendarOff,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import employeeService from '../services/employeeService';
import attendanceService from '../services/attendanceService';
import leaveService from '../services/leaveService';
import payrollService from '../services/payrollService';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
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

      // Concurrently query related records to display related history
      const [allAtt, allLeaves, allPayrolls] = await Promise.allSettled([
        attendanceService.getAllAttendance(),
        leaveService.getAllLeaves(),
        payrollService.getAllPayrolls(),
      ]);

      const empIdNum = Number(id);
      if (allAtt.status === 'fulfilled') {
        setAttendances((allAtt.value || []).filter((a) => a.employeeId === empIdNum));
      }
      if (allLeaves.status === 'fulfilled') {
        setLeaves((allLeaves.value || []).filter((l) => l.employeeId === empIdNum));
      }
      if (allPayrolls.status === 'fulfilled') {
        setPayrolls((allPayrolls.value || []).filter((p) => p.employeeId === empIdNum));
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      if (err.status === 404 || err.message?.includes('not found')) {
        setNotFound(true);
      } else {
        toastError(err.message || 'Failed to fetch employee details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!isAdmin) {
      toastError('Only administrators can delete employee profiles.');
      setDeleteOpen(false);
      return;
    }

    setDeleting(true);
    try {
      await employeeService.deleteEmployee(id);
      success('Employee deleted successfully.');
      navigate('/employees');
    } catch (err) {
      toastError(err.message || 'Failed to delete employee. Dependent records may exist.');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="py-16">
        <Loader message="Accessing encrypted staff record..." />
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
        <div className="w-12 h-12 bg-rose-500/15 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Employee Record Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested employee record could not be located in the current database.
        </p>
        <Button variant="primary" onClick={() => navigate('/employees')}>
          Return to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none font-sans">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>
        <PageHeader
          title={`${employee.firstName} ${employee.lastName}`}
          description={`Record ID: #${employee.id} • ${employee.designation}`}
          action={
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                icon={Edit2}
                onClick={() => navigate(`/employees/${employee.id}/edit`)}
              >
                Edit Profile
              </Button>
              {isAdmin && (
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete Staff
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Main Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-600/30 mb-4 border border-white/10">
            {employee.firstName?.[0]}
            {employee.lastName?.[0]}
          </div>

          <h2 className="text-lg font-black text-white">
            {employee.firstName} {employee.lastName}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">{employee.designation}</p>
          <div className="mt-3">
            <Badge variant="indigo" dot>
              {employee.departmentName || `Department #${employee.departmentId}`}
            </Badge>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-white/10 text-left space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-mono">{employee.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-mono">Joined: {employee.joiningDate}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-mono text-emerald-400 font-bold">
                Compensation: {formatCurrency(employee.salary)}
              </span>
            </div>
          </div>
        </div>

        {/* Employment & Detailed Information */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Personnel Specifications" subtitle="Core contract and demographic information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {employee.departmentName || `Department ID #${employee.departmentId}`}
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Gender Identification
                </span>
                <span className="text-sm font-bold text-white mt-1 block capitalize">
                  {employee.gender || 'Not specified'}
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Effective Start Date
                </span>
                <span className="text-sm font-bold text-white mt-1 block font-mono">
                  {employee.joiningDate}
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Base Remuneration
                </span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block font-mono">
                  {formatCurrency(employee.salary)} / yr
                </span>
              </div>
            </div>
          </Card>

          {/* Activity Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Attendance</p>
                <p className="text-lg font-black text-white">{attendances.length} logs</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <CalendarOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Leaves</p>
                <p className="text-lg font-black text-white">{leaves.length} requests</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payroll</p>
                <p className="text-lg font-black text-white">{payrolls.length} statements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Terminate Employee Profile"
        message={`Are you sure you want to permanently delete ${employee.firstName} ${employee.lastName}? All associated records will be revoked.`}
        confirmText="Confirm Termination"
        isLoading={deleting}
      />
    </div>
  );
};

export default EmployeeDetails;
