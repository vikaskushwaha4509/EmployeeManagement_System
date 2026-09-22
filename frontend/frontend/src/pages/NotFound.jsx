import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
        <HelpCircle className="w-7 h-7" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-1">404</h1>
      <h2 className="text-base font-semibold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={ArrowLeft}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;

