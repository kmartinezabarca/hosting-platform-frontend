import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const Delta = ({ value }) => {
  if (value == null) return null;
  const v = Number(value) || 0;
  const up = v > 0;
  const down = v < 0;
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  const color = up
    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
    : down
    ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    : 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800';

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', color)}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(v)}%
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  delta,
  colorClass = 'text-foreground',
  rightNode,
  onClick,
  delay,
  disabled = false,
}) => {
  const isClickable = Boolean(onClick) && !disabled;

  const handleClick = (e) => {
    if (!isClickable) return;
    // Evita activar el onClick del contenedor si se clickea un control interno (otro button, link, input, etc.)
    const interactive = e.target.closest('button, a, input, textarea, select, [role="button"]');
    if (interactive && interactive !== e.currentTarget) return;
    onClick?.(e);
  };

  const handleKeyDown = (e) => {
    if (!isClickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  const Wrapper = motion.div;

  return (
    <Wrapper
      aria-label={title}
      aria-disabled={disabled || !onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0 }}
      className={cn(
        'group relative flex flex-col text-left rounded-2xl border border-border bg-card p-6',
        'transition-all duration-200 hover:shadow-lg focus:outline-none',
        isClickable ? 'hover:border-primary/50 focus:ring-2 focus:ring-primary/50' : ''
      )}
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-lg bg-accent/50">
          <Icon className={cn('w-6 h-6', colorClass)} />
        </div>
        <Delta value={delta} />
      </div>

      {/* Main */}
      <div className="mt-3">
        <div className="text-3xl font-bold text-foreground leading-tight">{value}</div>
        {title && <p className="text-sm text-muted-foreground mt-1">{title}</p>}
        {subtitle && <p className="text-xs text-muted-foreground/80 mt-2">{subtitle}</p>}
        {rightNode && <div className="mt-3">{rightNode}</div>}
      </div>

      {/* Hover affordance */}
      {isClickable && (
        <div className="absolute bottom-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="w-5 h-5" />
        </div>
      )}
    </Wrapper>
  );
};

export default StatCard;
