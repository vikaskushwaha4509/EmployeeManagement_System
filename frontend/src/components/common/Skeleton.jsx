import React from 'react';

export const Skeleton = ({ className = '', rows = 1 }) => {
  if (rows > 1) {
    return (
      <div className="space-y-2.5 w-full">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-slate-200 animate-pulse rounded ${className}`}
          />
        ))}
      </div>
    );
  }
  return <div className={`h-4 bg-slate-200 animate-pulse rounded ${className}`} />;
};

export default Skeleton;
