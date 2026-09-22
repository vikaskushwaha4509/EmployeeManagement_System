import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message, text, size = 'md', className = '' }) => {
  const displayMessage = text || message || 'Loading...';
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 gap-2.5 text-slate-500 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-blue-600`} />
      {displayMessage && <p className="text-xs font-medium text-slate-500">{displayMessage}</p>}
    </div>
  );
};

export default Loader;
