import React from 'react';
import { Menu, LogOut, ShieldCheck, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getPageTitle = (pathname) => {
  if (pathname === '/' || pathname === '/dashboard') return 'Dashboard Overview';
  if (pathname === '/employees') return 'Employee Directory';
  if (pathname === '/employees/add') return 'Add New Employee';
  if (pathname.includes('/employees/') && pathname.includes('/edit')) return 'Edit Employee';
  if (pathname.startsWith('/employees/')) return 'Employee Profile';
  if (pathname === '/departments') return 'Departments';
  if (pathname === '/attendance') return 'Attendance';
  if (pathname === '/leaves') return 'Leave Requests';
  if (pathname === '/payroll') return 'Payroll Management';
  return 'Employee Management';
};

export const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Amazon Portal Tag */}
        <div className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md border border-slate-200">
          Amazon HR Network
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-800">
              {user?.fullName || user?.username || 'Amazon Staff'}
            </div>
            <div className="text-[11px] font-medium text-amber-600">
              {isAdmin ? 'Administrator' : 'Employee'}
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-slate-600" />}
          </div>

          <button
            onClick={logout}
            className="text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-slate-50 px-2 py-1.5 rounded transition-colors flex items-center gap-1"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
