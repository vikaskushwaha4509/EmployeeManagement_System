import React from 'react';
import { Menu, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
  if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/employees') return 'Employees';
  if (pathname === '/employees/add') return 'Add Employee';
  if (pathname.includes('/employees/') && pathname.includes('/edit')) return 'Edit Employee';
  if (pathname.startsWith('/employees/')) return 'Employee Details';
  if (pathname === '/departments') return 'Departments';
  if (pathname === '/attendance') return 'Attendance';
  if (pathname === '/leaves') return 'Leaves';
  if (pathname === '/payroll') return 'Payroll';
  return 'Employee Management';
};

export const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

