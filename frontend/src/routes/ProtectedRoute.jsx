import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-indigo-500/10 blur-sm" />
        </div>
        <p className="text-xs font-medium tracking-wide uppercase text-slate-500">
          Authenticating Enterprise Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-rose-200/80 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Authorization Required</h2>
          <p className="text-sm text-slate-500 mt-2">
            This module contains protected enterprise controls restricted to users with the <span className="font-semibold text-rose-600">ROLE_ADMIN</span> authority.
          </p>
          <div className="mt-6">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => window.history.back()}
              className="w-full"
            >
              Return to Previous Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
