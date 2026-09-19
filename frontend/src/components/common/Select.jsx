import React, { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  error,
  helperText,
  id,
  options = [],
  placeholder = 'Select an option',
  className = '',
  required = false,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        required={required}
        className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" className="text-slate-400">
            {placeholder}
          </option>
        )}
        {children
          ? children
          : options.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={value} value={value}>
                  {optLabel}
                </option>
              );
            })}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
