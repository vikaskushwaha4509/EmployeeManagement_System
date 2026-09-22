import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import AddEmployee from '../pages/AddEmployee';
import EditEmployee from '../pages/EditEmployee';
import EmployeeDetails from '../pages/EmployeeDetails';
import Departments from '../pages/Departments';
import Attendance from '../pages/Attendance';
import Leaves from '../pages/Leaves';
import Payroll from '../pages/Payroll';
import NotFound from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Portal */}
      <Route path="/login" element={<Login />} />

      {/* Protected EMS Enterprise Portal */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Employee Management Routes */}
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/employees/:id/edit" element={<EditEmployee />} />

        {/* Alias routes for convenience */}
        <Route path="/employee/add" element={<Navigate to="/employees/add" replace />} />
        <Route path="/employee/:id" element={<EmployeeDetails />} />
        <Route path="/employee/:id/edit" element={<EditEmployee />} />

        {/* Domain Modules */}
        <Route path="/departments" element={<Departments />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/payroll" element={<Payroll />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
