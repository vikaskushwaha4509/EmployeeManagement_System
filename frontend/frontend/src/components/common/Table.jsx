import React from 'react';
import Loader from './Loader';
import EmptyState from './EmptyState';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  loading = false,
  emptyMessage = 'No records found',
  emptyDescription = 'There is currently no data to display.',
  emptyActionLabel,
  onEmptyAction,
  className = '',
}) => {
  const isTableLoading = isLoading || loading;

  if (isTableLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10">
        <Loader message="Loading data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <EmptyState
          title={emptyMessage}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-3.5 px-4 sm:px-6 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-700 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
