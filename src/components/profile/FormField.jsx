import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const FormField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  success,
  disabled = false,
  required = false,
  className,
  description,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
            hasError ? 'text-red-500' : 
            hasSuccess ? 'text-green-500' :
            isFocused ? 'text-blue-500' : 'text-slate-400'
          )} />
        )}
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            Icon ? 'pl-10' : 'pl-4',
            showPasswordToggle ? 'pr-10' : 'pr-4',
            'py-3',
            hasError ? [
              'border-red-300 dark:border-red-700',
              'focus:border-red-500 focus:ring-red-500/20'
            ] : hasSuccess ? [
              'border-green-300 dark:border-green-700',
              'focus:border-green-500 focus:ring-green-500/20'
            ] : [
              'border-slate-300 dark:border-slate-600',
              'focus:border-blue-500 focus:ring-blue-500/20',
              'hover:border-slate-400 dark:hover:border-slate-500'
            ],
            disabled && 'bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed',
            isFocused && 'shadow-sm'
          )}
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
        )}
      </div>
      
      {description && !error && !success && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {success}
        </p>
      )}
    </div>
  );
};

export default FormField;

