import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'w-full rounded-xl border text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 bg-background dark:bg-[#0f1115]',
  {
    variants: {
      state: {
        default: [
          'border-border/70',
          'hover:border-foreground/30',
          'focus:border-foreground/40 focus:ring-foreground/10',
        ],
        error: [
          'border-red-500/60 bg-red-500/[0.03]',
          'focus:border-red-500 focus:ring-red-500/15',
        ],
        success: [
          'border-emerald-500/60',
          'focus:border-emerald-500 focus:ring-emerald-500/15',
        ],
      },
      hasIcon:   { true: 'pl-10', false: 'pl-4' },
      hasToggle: { true: 'pr-10', false: 'pr-4' },
    },
    defaultVariants: { state: 'default', hasIcon: false, hasToggle: false },
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
}: {
  [x: string]: any;
  label?: any;
  type?: string;
  value?: any;
  onChange?: any;
  placeholder?: any;
  icon?: any;
  error?: any;
  success?: any;
  disabled?: boolean;
  required?: boolean;
  className?: any;
  description?: any;
  showPasswordToggle?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType   = showPasswordToggle && showPassword ? 'text' : type;
  const hasError    = !!error;
  const hasSuccess  = !!success && !hasError;
  const fieldState  = hasError ? 'error' : hasSuccess ? 'success' : 'default';

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className={cn(
            'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none',
            fieldState === 'error'   ? 'text-red-500' :
            fieldState === 'success' ? 'text-emerald-500' :
            'text-muted-foreground/60'
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
            'py-2.5 text-sm',
            disabled && 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-70'
          )}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {!showPasswordToggle && (hasError || hasSuccess) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {hasError   && <AlertCircle  className="w-4 h-4 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
        )}
      </div>

      {description && !error && !success && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </p>
      )}
      {success && !error && (
        <p className="text-xs text-emerald-600 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />{success}
        </p>
      )}
    </div>
  );
};

export default FormField;
