import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-t border-slate-200 text-xs sm:text-sm text-slate-500 ${className}`}>
      <div>
        Showing <span className="font-semibold text-slate-700">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-700">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span> entries
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={page}>
                  {prev && page - prev > 1 && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`h-7 w-7 text-xs font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
