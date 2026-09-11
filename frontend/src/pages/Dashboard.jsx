import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  CalendarCheck,
  Clock,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import dashboardService from '../services/dashboardService';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import attendanceService from '../services/attendanceService';
import leaveService from '../services/leaveService';
import { MONTHS } from '../constants/enums';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const Dashboard = () => {
  const currentDate = new Date();
  const currentMonthName = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const { user, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [summary, setSummary] = useState(null);
  const [deptDistribution, setDeptDistribution] = useState([]);
  const [attendanceBreakdown, setAttendanceBreakdown] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingLeaveId, setProcessingLeaveId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch summary from DashboardController GET /summary?month=...&year=...
      const summaryData = await dashboardService.getDashboardSummary(selectedMonth, selectedYear);
      setSummary(summaryData);

      // 2. Concurrently fetch real entities to generate real visual charts
      const [employees, departments, attendance, leaves] = await Promise.allSettled([
        employeeService.getAllEmployees(),
        departmentService.getAllDepartments(),
        attendanceService.getAllAttendance(),
        leaveService.getAllLeaves(),
      ]);

      // Calculate Employee by Department distribution from real data
      if (departments.status === 'fulfilled' && employees.status === 'fulfilled') {
        const depts = departments.value || [];
        const emps = employees.value || [];
        const dist = depts.map((d) => {
          const count = emps.filter((e) => e.departmentId === d.id || e.departmentName === d.name).length;
          return {
            name: d.name,
            count,
          };
        });
        setDeptDistribution(dist);
      }

      // Calculate real attendance breakdown
      if (attendance.status === 'fulfilled') {
        const attList = attendance.value || [];
        const statusCounts = { PRESENT: 0, ABSENT: 0, HALF_DAY: 0, LEAVE: 0 };
        attList.forEach((a) => {
          if (statusCounts[a.status] !== undefined) {
            statusCounts[a.status] += 1;
          }
        });
        const attChart = Object.entries(statusCounts)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({
            name: name.replace('_', ' '),
            value,
          }));
        setAttendanceBreakdown(attChart);
      }

      // Recent Leaves
      if (leaves.status === 'fulfilled') {
        const leaveList = leaves.value || [];
        setRecentLeaves(leaveList.slice(-6).reverse());
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateLeaveStatus = async (leaveId, newStatus) => {
    if (!isAdmin) return;
    setProcessingLeaveId(leaveId);
    try {
      await leaveService.updateLeaveStatus(leaveId, newStatus);
      success(`Leave request has been marked as ${newStatus}.`);
      // Update local recent leaves list
      setRecentLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, status: newStatus } : l))
      );
      // Refresh summary numbers
      const updatedSummary = await dashboardService.getDashboardSummary(selectedMonth, selectedYear);
      setSummary(updatedSummary);
    } catch (err) {
      toastError(err.message || 'Failed to update leave status');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Top Banner & Filter Controls */}
      <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Background radiant highlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Live Telemetry
              </span>
              {isAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Admin Powers Unlocked
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome back, {user?.fullName || user?.username || 'Executive'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time enterprise metrics & staff intelligence from Spring Boot 4.1.0 backend
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 text-xs font-semibold bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              isLoading={loading}
              icon={RefreshCw}
            >
              Sync
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={fetchDashboardData}>
            Retry Sync
          </Button>
        </div>
      )}

      {loading && !summary ? (
        <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-12">
          <Loader message="Synchronizing enterprise telemetry..." />
        </div>
      ) : summary ? (
        <>
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Employees */}
            <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl hover:border-indigo-500/30 transition-all group overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Staff</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {summary.totalEmployees}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Active Roster</span>
              </div>
            </div>

            {/* Total Departments */}
            <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl hover:border-cyan-500/30 transition-all group overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Departments</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {summary.totalDepartments}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold mt-2">
                <Activity className="w-3.5 h-3.5" />
                <span>Operational Units</span>
              </div>
            </div>

            {/* Present Today */}
            <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl hover:border-emerald-500/30 transition-all group overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Present Today</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {summary.presentToday}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live On-Site</span>
              </div>
            </div>

            {/* Pending Leaves */}
            <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl hover:border-amber-500/30 transition-all group overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Leaves</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {summary.pendingLeaveRequests}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold mt-2">
                <span>Requires Review</span>
              </div>
            </div>

            {/* Total Payroll */}
            <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-xl hover:border-purple-500/30 transition-all group overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Payroll ({selectedMonth.slice(0, 3)})
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {formatCurrency(summary.totalPayroll)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-purple-400 font-semibold mt-2">
                <span>Processed Total</span>
              </div>
            </div>
          </div>

          {/* Visual Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Department Distribution */}
            <Card
              title="Department Headcount Distribution"
              subtitle="Current staffing distribution mapped across organizational units"
            >
              {deptDistribution.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-20} textAnchor="end" />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        }}
                        itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                      />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Headcount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                  No department distribution records registered.
                </div>
              )}
            </Card>

            {/* Chart 2: Attendance Breakdown */}
            <Card
              title="Attendance Status Breakdown"
              subtitle="Telemetry summary of employee attendance logs"
            >
              {attendanceBreakdown.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {attendanceBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                  No attendance records logged for this period.
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions & Recent Leaves */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Hub */}
            <Card title="Administrative Quick Hub" subtitle="Frequently accessed workflows">
              <div className="space-y-2.5">
                <Link
                  to="/employees/add"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        Onboard New Employee
                      </div>
                      <div className="text-[11px] text-slate-400">Register employee and department</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/attendance"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 hover:bg-emerald-600/10 border border-white/5 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Mark Daily Attendance
                      </div>
                      <div className="text-[11px] text-slate-400">Log presence, half-days, or leaves</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/leaves"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 hover:bg-amber-600/10 border border-white/5 hover:border-amber-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        Review Leave Approvals
                      </div>
                      <div className="text-[11px] text-slate-400">Manage time-off and status</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/payroll"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 hover:bg-purple-600/10 border border-white/5 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        Process Monthly Payroll
                      </div>
                      <div className="text-[11px] text-slate-400">Generate compensation statements</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </Card>

            {/* Recent Leaves Table with 1-Click Admin Approvals */}
            <div className="lg:col-span-2">
              <Card
                title="Recent Leave Requests"
                subtitle="Latest employee leave submissions and admin action queue"
                action={
                  <Link
                    to="/leaves"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              >
                {recentLeaves.length > 0 ? (
                  <div className="divide-y divide-white/5 -my-2">
                    {recentLeaves.map((l) => {
                      let badgeVariant = 'amber';
                      if (l.status === 'APPROVED') badgeVariant = 'emerald';
                      if (l.status === 'REJECTED') badgeVariant = 'rose';

                      const isPending = l.status === 'PENDING';

                      return (
                        <div key={l.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {l.employeeName || `Employee #${l.employeeId}`}
                              </span>
                              <Badge variant={badgeVariant} dot size="sm">
                                {l.status}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {l.startDate} to {l.endDate} &bull; <span className="italic">{l.reason}</span>
                            </div>
                          </div>

                          {/* Admin fast-action buttons */}
                          {isAdmin && isPending ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleUpdateLeaveStatus(l.id, 'APPROVED')}
                                disabled={processingLeaveId === l.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all disabled:opacity-50"
                                title="Approve this leave request"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleUpdateLeaveStatus(l.id, 'REJECTED')}
                                disabled={processingLeaveId === l.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all disabled:opacity-50"
                                title="Reject this leave request"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No leave requests logged in the system.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
