import React from 'react';

export const PageHeader = ({
  title,
  description,
  action,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}>
      <div>
        {breadcrumbs && <div className="mb-1 text-xs text-slate-500">{breadcrumbs}</div>}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
