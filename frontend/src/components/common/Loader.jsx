import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 text-slate-400 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-indigo-400`} />
      {message && <p className="text-xs font-semibold tracking-wide text-slate-400">{message}</p>}
    </div>
  );
};

export default Loader;
