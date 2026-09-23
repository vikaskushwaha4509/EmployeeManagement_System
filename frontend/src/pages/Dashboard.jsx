import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  CalendarCheck,
  FileText,
  RefreshCw,
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import dashboardService from '../services/dashboardService';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import attendanceService from '../services/attendanceService';
import leaveService from '../services/leaveService';
import { MONTHS } from '../constants/enums';

// Colors matching the department chart theme
const DEPT_COLORS = {
  Engineering: '#2563eb', // Blue
  HR: '#10b981',          // Green
  Finance: '#f59e0b',     // Amber / Yellow
  Marketing: '#ef4444',   // Coral / Red
  Operations: '#8b5cf6',  // Purple
  Others: '#94a3b8',      // Grey
};

const COLOR_PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#94a3b8', '#06b6d4', '#ec4899'];

const INITIAL_ATTENDANCE_OVERVIEW = {
  present: 0,
  absent: 0,
  halfDay: 0,
  onLeave: 0,
};

export const Dashboard = () => {
  const currentDate = new Date();
  const currentMonthName = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isCustomFilterOpen, setIsCustomFilterOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [departmentsCount, setDepartmentsCount] = useState(0);
  const [deptDistribution, setDeptDistribution] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState(INITIAL_ATTENDANCE_OVERVIEW);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format dynamic current date e.g. "Fri, 19 Sep 2026"
  const formattedToday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(currentDate);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const summaryData = await dashboardService
        .getDashboardSummary(selectedMonth, Number(selectedYear) || currentYear)
        .catch(() => null);

      const [empRes, deptRes, attRes, leaveRes] = await Promise.allSettled([
        employeeService.getAllEmployees(),
        departmentService.getAllDepartments(),
        attendanceService.getAllAttendance(),
        leaveService.getAllLeaves(),
      ]);

      const employees = empRes.status === 'fulfilled' && Array.isArray(empRes.value) ? empRes.value : [];
      const departments = deptRes.status === 'fulfilled' && Array.isArray(deptRes.value) ? deptRes.value : [];
      const attendances = attRes.status === 'fulfilled' && Array.isArray(attRes.value) ? attRes.value : [];
      const leaves = leaveRes.status === 'fulfilled' && Array.isArray(leaveRes.value) ? leaveRes.value : [];

      setEmployeesCount(employees.length);
      setDepartmentsCount(departments.length);

      if (summaryData) {
        setSummary(summaryData);
      } else {
        setSummary(null);
      }

      // 1. Department Distribution Chart
      if (departments.length > 0 && employees.length > 0) {
        const distribution = departments.map((dept, index) => {
          const count = employees.filter(
            (e) => e.departmentId === dept.id || e.departmentName === dept.name || e.department?.id === dept.id
          ).length;
          return {
            name: dept.name,
            value: count || 0,
            color: DEPT_COLORS[dept.name] || COLOR_PALETTE[index % COLOR_PALETTE.length],
          };
        }).filter(item => item.value > 0);

        setDeptDistribution(distribution);
      } else {
        setDeptDistribution([]);
      }

      // 2. Attendance Overview (Today) Donut Chart
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeLeavesToday = leaves.filter((l) => {
        const isApproved = l.status === 'APPROVED' || l.status === 'Approved';
        if (!isApproved || !l.startDate) return false;
        const start = new Date(l.startDate);
        start.setHours(0, 0, 0, 0);
        const end = l.endDate ? new Date(l.endDate) : new Date(l.startDate);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      }).length;

      let presentCount = 0;
      let halfDayCount = 0;

      attendances.forEach((att) => {
        if (!att.attendanceDate) return;
        const attDate = new Date(att.attendanceDate);
        attDate.setHours(0, 0, 0, 0);
        if (attDate.getTime() === today.getTime()) {
          const st = (att.status || '').toUpperCase();
          if (st === 'PRESENT') {
            presentCount += 1;
          } else if (st === 'HALF_DAY' || st === 'HALFDAY' || st === 'HALF DAY') {
            halfDayCount += 1;
          }
        }
      });

      if (summaryData?.presentToday !== undefined && summaryData?.presentToday !== null && presentCount === 0 && halfDayCount === 0) {
        presentCount = summaryData.presentToday;
      }

      const totalEmp = summaryData?.totalEmployees ?? employees.length;
      const onLeaveCount = activeLeavesToday;
      const absentCount = Math.max(0, totalEmp - presentCount - halfDayCount - onLeaveCount);

      setAttendanceOverview({
        present: presentCount,
        absent: absentCount,
        halfDay: halfDayCount,
        onLeave: onLeaveCount,
      });

      // 3. Recent Employees Table
      if (employees.length > 0) {
        const sortedEmps = [...employees].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);
        setRecentEmployees(
          sortedEmps.map((emp, idx) => ({
            id: emp.id || idx + 1,
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Employee #${emp.id}`,
            department: emp.departmentName || emp.department?.name || 'General',
            joiningDate: formatDateDisplay(emp.joiningDate),
          }))
        );
      } else {
        setRecentEmployees([]);
      }

      // 4. Recent Leaves Table
      if (leaves.length > 0) {
        const sortedLeaves = [...leaves].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);
        setRecentLeaves(
          sortedLeaves.map((l, idx) => {
            let statusNormalized = 'Pending';
            if (l.status === 'APPROVED') statusNormalized = 'Approved';
            else if (l.status === 'REJECTED') statusNormalized = 'Rejected';

            return {
              id: l.id || idx + 1,
              name: l.employeeName || (l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : `Employee #${l.employeeId}`),
              department: l.departmentName || l.employee?.department?.name || 'N/A',
              leaveType: l.reason || 'Leave',
              date: formatDateDisplay(l.startDate),
              status: statusNormalized,
            };
          })
        );
      } else {
        setRecentLeaves([]);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, currentYear]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Format payroll in Indian format (Lakhs or standard)
  const formatPayrollDisplay = (amount) => {
    if (amount === undefined || amount === null) return '₹ 0';
    const num = Number(amount);
    if (isNaN(num) || num === 0) return '₹ 0';
    if (num >= 100000) {
      const inLakhs = (num / 100000).toFixed(1);
      return `₹ ${inLakhs}L`;
    }
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  // Custom label inside Attendance Donut slices
  const renderAttendanceDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    if (!value || value <= 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {value}
      </text>
    );
  };

  // Custom label inside Department Pie slices
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    if (!value || value <= 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {value}
      </text>
    );
  };

  const totalEmployeesCount = summary?.totalEmployees ?? employeesCount;
  const totalDepartmentsCount = summary?.totalDepartments ?? departmentsCount;
  const presentTodayCount = summary?.presentToday ?? attendanceOverview.present;
  const onLeaveTodayCount = summary?.pendingLeaveRequests ?? attendanceOverview.onLeave;
  const payrollDisplay = formatPayrollDisplay(summary?.totalPayroll);

  const attendanceChartData = [
    { name: 'Present', value: attendanceOverview.present, color: '#10b981' },
    { name: 'Absent', value: attendanceOverview.absent, color: '#ef4444' },
    { name: 'Half Day', value: attendanceOverview.halfDay, color: '#f97316' },
    { name: 'On Leave', value: attendanceOverview.onLeave, color: '#eab308' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of your organization
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsCustomFilterOpen((prev) => !prev)}
            title="Filter by custom month & manual year"
            className="text-xs text-slate-500 hover:text-blue-600 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {selectedMonth} {selectedYear} &bull; Filter
          </button>
          <div className="text-sm font-medium text-slate-700 bg-white/80 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            {formattedToday}
          </div>
          <button
            onClick={loadDashboardData}
            title="Refresh Data"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Optional Year/Month Filter Bar (Allows entering ANY custom year freely) */}
      {isCustomFilterOpen && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 transition-all">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Year (Any):</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="e.g. 2026"
              className="w-28 px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={loadDashboardData}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setSelectedMonth(currentMonthName);
              setSelectedYear(currentYear);
              setIsCustomFilterOpen(false);
            }}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Reset
          </button>
        </div>
      )}

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Employees */}
        <div className="bg-[#eff6ff] rounded-2xl p-5 border border-blue-100/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalEmployeesCount}
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              Employees
            </div>
          </div>
        </div>

        {/* Card 2: Departments */}
        <div className="bg-[#f5f3ff] rounded-2xl p-5 border border-purple-100/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalDepartmentsCount}
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              Departments
            </div>
          </div>
        </div>

        {/* Card 3: Present Today */}
        <div className="bg-[#ecfdf5] rounded-2xl p-5 border border-emerald-100/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {presentTodayCount}
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              Present Today
            </div>
          </div>
        </div>

        {/* Card 4: On Leave Today */}
        <div className="bg-[#fffbeb] rounded-2xl p-5 border border-amber-100/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {onLeaveTodayCount}
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              On Leave Today
            </div>
          </div>
        </div>

        {/* Card 5: Payroll (This Month) */}
        <div className="bg-[#ffe4e6] rounded-2xl p-5 border border-rose-100/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-rose-600">₹</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {payrollDisplay}
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              Payroll (This Month)
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Overview (Today) Donut Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Attendance Overview (Today)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 h-64 sm:h-72">
            {/* Donut Chart (Left) */}
            <div className="sm:col-span-7 relative h-full w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      attendanceChartData.length > 0
                        ? attendanceChartData
                        : [{ name: 'No Data', value: 1, color: '#f1f5f9' }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                    labelLine={false}
                    label={attendanceChartData.length > 0 ? renderAttendanceDonutLabel : false}
                  >
                    {(attendanceChartData.length > 0
                      ? attendanceChartData
                      : [{ name: 'No Data', value: 1, color: '#f1f5f9' }]
                    ).map((entry, index) => (
                      <Cell key={`att-donut-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {attendanceChartData.length > 0 && (
                    <Tooltip
                      formatter={(val, name) => [`${val}`, name]}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        color: '#fff',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                  {totalEmployeesCount}
                </span>
                <span className="text-xs font-semibold text-slate-700 mt-1 leading-tight">
                  Total
                </span>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  Employees
                </span>
              </div>
            </div>

            {/* Legend / Stats (Right) */}
            <div className="sm:col-span-5 flex flex-col justify-center space-y-3 px-2 sm:px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">Present</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{attendanceOverview.present}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#ef4444] shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">Absent</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{attendanceOverview.absent}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#f97316] shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">Half Day</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{attendanceOverview.halfDay}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#eab308] shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">On Leave</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{attendanceOverview.onLeave}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department-wise Employees Pie Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Department-wise Employees
            </h2>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            {deptDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptDistribution}
                    cx="45%"
                    cy="50%"
                    outerRadius={88}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {deptDistribution.map((entry, index) => (
                      <Cell
                        key={`dept-cell-${index}`}
                        fill={entry.color || COLOR_PALETTE[index % COLOR_PALETTE.length]}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Employees`, name]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      color: '#fff',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs font-medium text-slate-700 ml-1">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                <Building2 className="w-8 h-8 text-slate-300 mb-2" />
                <span>No department distribution data available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Employees & Recent Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Employees Table */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Recent Employees
            </h2>
            <Link
              to="/employees"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  <th className="pb-3 pr-3">#</th>
                  <th className="pb-3 pr-3">Name</th>
                  <th className="pb-3 pr-3">Department</th>
                  <th className="pb-3">Joining Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentEmployees.length > 0 ? (
                  recentEmployees.map((emp, index) => (
                    <tr key={emp.id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-3 font-semibold text-slate-700">{emp.id || index + 1}</td>
                      <td className="py-3 pr-3 font-medium text-slate-900">{emp.name}</td>
                      <td className="py-3 pr-3 text-slate-600">{emp.department}</td>
                      <td className="py-3 text-slate-600 whitespace-nowrap">{emp.joiningDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                      No recent employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leave Requests Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Recent Leave Requests
            </h2>
            <Link
              to="/leaves"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  <th className="pb-3 pr-2">#</th>
                  <th className="pb-3 pr-2">Name</th>
                  <th className="pb-3 pr-2">Department</th>
                  <th className="pb-3 pr-2">Leave Type</th>
                  <th className="pb-3 pr-2">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentLeaves.length > 0 ? (
                  recentLeaves.map((leave, index) => {
                    const isApproved = leave.status === 'Approved' || leave.status === 'APPROVED';
                    const isRejected = leave.status === 'Rejected' || leave.status === 'REJECTED';
                    const isPending = !isApproved && !isRejected;

                    return (
                      <tr key={leave.id || index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pr-2 font-semibold text-slate-700">{leave.id || index + 1}</td>
                        <td className="py-3 pr-2 font-medium text-slate-900 whitespace-nowrap">{leave.name}</td>
                        <td className="py-3 pr-2 text-slate-600">{leave.department}</td>
                        <td className="py-3 pr-2 text-slate-600 whitespace-nowrap">{leave.leaveType}</td>
                        <td className="py-3 pr-2 text-slate-600 whitespace-nowrap">{leave.date}</td>
                        <td className="py-3">
                          {isApproved && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#dcfce7] text-[#166534]">
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef3c7] text-[#92400e]">
                              Pending
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#991b1b]">
                              Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No recent leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
