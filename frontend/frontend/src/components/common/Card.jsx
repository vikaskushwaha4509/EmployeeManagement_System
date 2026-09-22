import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            {title && <h3 className="font-bold text-slate-800 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
