import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'w-full rounded-lg border text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-card',
  {
    variants: {
      state: {
        default: [
          'border-border',
          'focus:border-primary focus:ring-primary/30',
          'hover:border-foreground/50',
        ],
        error: [
          'border-destructive text-destructive',
          'focus:border-destructive focus:ring-destructive/30',
        ],
        success: [
          'border-green-500',
          'focus:border-green-600 focus:ring-green-500/30',
        ],
      },
      hasIcon: {
        true: 'pl-10',
        false: 'pl-4',
      },
      hasToggle: {
        true: 'pr-10',
        false: 'pr-4',
      },
    },
    defaultVariants: {
      state: 'default',
      hasIcon: false,
      hasToggle: false,
    },
  }
);

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
  const inputType = showPasswordToggle && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;
  const fieldState = hasError ? 'error' : hasSuccess ? 'success' : 'default';

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
            fieldState === 'error' ? 'text-destructive' :
            fieldState === 'success' ? 'text-green-500' :
            'text-muted-foreground'
          )} />
        )}
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            inputVariants({ state: fieldState, hasIcon: !!Icon, hasToggle: showPasswordToggle }),
            'py-2.5',
            disabled && 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {!showPasswordToggle && (hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && <AlertCircle className="w-5 h-5 text-destructive" />}
            {hasSuccess && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>
        )}
      </div>
      
      {description && !error && !success && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-sm text-green-600 flex items-center gap-1.5 mt-1.5">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </p>
      )}
    </div>
  );
};

export default FormField;