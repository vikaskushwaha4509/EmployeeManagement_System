import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none font-sans">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/30 shadow-2xl">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-200 mb-2">Route Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-8">
        The requested endpoint or view does not exist in the enterprise portal. Navigate via the sidebar or return to the overview.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={ArrowLeft}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
