import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  User,
  Building2,
  CalendarCheck,
  FileText,
  BadgeDollarSign,
  X,
  Users,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', to: '/dashboard', icon: Home },
  { name: 'Employees', to: '/employees', icon: User },
  { name: 'Departments', to: '/departments', icon: Building2 },
  { name: 'Attendance', to: '/attendance', icon: CalendarCheck },
  { name: 'Leaves', to: '/leaves', icon: FileText },
  { name: 'Payroll', to: '/payroll', icon: BadgeDollarSign },
];

export const Sidebar = ({ isOpen, onClose }) => {
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
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-[#1e293b] text-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 select-none shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-white shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-white tracking-wide">
                Employee
              </div>
              <div className="text-xs font-semibold text-slate-300">
                Management System
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6 px-3 overflow-y-auto space-y-1.5">
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
                  `flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-md font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-semibold text-xs shrink-0 border border-blue-500/30">
              <User className="w-4 h-4 text-blue-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                Admin User
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                admin@ems.com
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

