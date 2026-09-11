import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  Receipt,
  X,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', to: '/employees', icon: Users },
  { name: 'Departments', to: '/departments', icon: Building2 },
  { name: 'Attendance', to: '/attendance', icon: CalendarCheck },
  { name: 'Leaves', to: '/leaves', icon: CalendarOff },
  { name: 'Payroll', to: '/payroll', icon: Receipt },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-[#232f3e] text-slate-200 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Amazon Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-[#131921] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white lowercase">
              amazon
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500 text-slate-900 ml-1">
              EMS
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 overflow-y-auto space-y-1">
          <div className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#131921] text-amber-400 font-semibold border-l-4 border-amber-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Session Footer */}
        <div className="p-4 bg-[#1a222d] border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4 text-slate-300" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.fullName || user?.username || 'Amazon User'}
                </div>
                <div className="text-[11px] text-amber-400 font-medium">
                  {isAdmin ? 'Administrator' : 'Staff Member'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
