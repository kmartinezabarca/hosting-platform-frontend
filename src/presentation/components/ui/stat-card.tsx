import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import { Progress } from './progress';
import { Skeleton } from './skeleton';

type Accent =
  | 'slate'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'red'
  | 'orange'
  | 'violet'
  | 'cyan'
  | 'purple';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  accent?: Accent;
  className?: string;
  loading?: boolean;
}

const accentConfig: Record<
  Accent,
  {
    glow: string;
    border: string;
    iconBg: string;
    iconColor: string;
    progress: string;
    accentLine: string;
  }
> = {
  slate: {
    glow: 'from-slate-500/[0.05] via-slate-500/[0.02] to-transparent',
    border: 'border-slate-200/70 dark:border-white/[0.05]',
    iconBg: 'bg-slate-500/[0.08] dark:bg-slate-400/[0.08]',
    iconColor: 'text-slate-700 dark:text-slate-300',
    progress: '[&>div]:bg-slate-500 dark:[&>div]:bg-slate-400',
    accentLine: 'bg-slate-500/60',
  },

  blue: {
    glow: 'from-blue-500/[0.05] via-blue-500/[0.02] to-transparent',
    border: 'border-blue-200/70 dark:border-blue-900/30',
    iconBg: 'bg-blue-500/[0.08] dark:bg-blue-500/[0.12]',
    iconColor: 'text-blue-700 dark:text-blue-400',
    progress: '[&>div]:bg-blue-500 dark:[&>div]:bg-blue-400',
    accentLine: 'bg-blue-500/60',
  },

  emerald: {
    glow: 'from-emerald-500/[0.05] via-emerald-500/[0.02] to-transparent',
    border: 'border-emerald-200/70 dark:border-emerald-900/30',
    iconBg: 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12]',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    progress: '[&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-400',
    accentLine: 'bg-emerald-500/60',
  },

  amber: {
    glow: 'from-amber-500/[0.05] via-amber-500/[0.02] to-transparent',
    border: 'border-amber-200/70 dark:border-amber-900/30',
    iconBg: 'bg-amber-500/[0.08] dark:bg-amber-500/[0.12]',
    iconColor: 'text-amber-700 dark:text-amber-400',
    progress: '[&>div]:bg-amber-500 dark:[&>div]:bg-amber-400',
    accentLine: 'bg-amber-500/60',
  },

  red: {
    glow: 'from-red-500/[0.05] via-red-500/[0.02] to-transparent',
    border: 'border-red-200/70 dark:border-red-900/30',
    iconBg: 'bg-red-500/[0.08] dark:bg-red-500/[0.12]',
    iconColor: 'text-red-700 dark:text-red-400',
    progress: '[&>div]:bg-red-500 dark:[&>div]:bg-red-400',
    accentLine: 'bg-red-500/60',
  },

  orange: {
    glow: 'from-orange-500/[0.05] via-orange-500/[0.02] to-transparent',
    border: 'border-orange-200/70 dark:border-orange-900/30',
    iconBg: 'bg-orange-500/[0.08] dark:bg-orange-500/[0.12]',
    iconColor: 'text-orange-700 dark:text-orange-400',
    progress: '[&>div]:bg-orange-500 dark:[&>div]:bg-orange-400',
    accentLine: 'bg-orange-500/60',
  },

  violet: {
    glow: 'from-violet-500/[0.05] via-violet-500/[0.02] to-transparent',
    border: 'border-violet-200/70 dark:border-violet-900/30',
    iconBg: 'bg-violet-500/[0.08] dark:bg-violet-500/[0.12]',
    iconColor: 'text-violet-700 dark:text-violet-400',
    progress: '[&>div]:bg-violet-500 dark:[&>div]:bg-violet-400',
    accentLine: 'bg-violet-500/60',
  },

  cyan: {
    glow: 'from-cyan-500/[0.05] via-cyan-500/[0.02] to-transparent',
    border: 'border-cyan-200/70 dark:border-cyan-900/30',
    iconBg: 'bg-cyan-500/[0.08] dark:bg-cyan-500/[0.12]',
    iconColor: 'text-cyan-700 dark:text-cyan-400',
    progress: '[&>div]:bg-cyan-500 dark:[&>div]:bg-cyan-400',
    accentLine: 'bg-cyan-500/60',
  },

  purple: {
    glow: 'from-purple-500/[0.05] via-purple-500/[0.02] to-transparent',
    border: 'border-purple-200/70 dark:border-purple-900/30',
    iconBg: 'bg-purple-500/[0.08] dark:bg-purple-500/[0.12]',
    iconColor: 'text-purple-700 dark:text-purple-400',
    progress: '[&>div]:bg-purple-500 dark:[&>div]:bg-purple-400',
    accentLine: 'bg-purple-500/60',
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  progress,
  accent = 'slate',
  className,
  loading,
}: StatCardProps) {
  const cfg = accentConfig[accent];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border',
        'bg-white dark:bg-zinc-900',
        'transition-[transform,box-shadow] duration-150',
        'hover:-translate-y-0.5',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)]',
        'hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_10px_24px_rgba(0,0,0,0.08)]',
        'dark:shadow-black/20',
        cfg.border,
        className,
      )}
    >
      {/* Accent line */}
      <div
        className={cn(
          'absolute left-0 top-5 bottom-5 w-[2px] rounded-full',
          cfg.accentLine,
        )}
      />

      {/* Soft gradient glow */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br',
          cfg.glow,
        )}
      />

      {/* Soft top shine */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-white/[0.02]" />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Content */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <Skeleton className="h-3 w-20 rounded-full" />
            ) : (
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
                {label}
              </p>
            )}

            {loading ? (
              <Skeleton className="mt-2 h-8 w-24 rounded-lg" />
            ) : (
              <h3 className="mt-1 text-4xl font-bold tracking-[-0.05em] text-zinc-950 dark:text-white">
                {value}
              </h3>
            )}

            {subtitle ? (
              loading ? (
                <Skeleton className="mt-2 h-3 w-28 rounded-full" />
              ) : (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {subtitle}
                </p>
              )
            ) : null}
          </div>

          {/* Icon */}
          <div
            className={cn(
              'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              'ring-1 ring-black/[0.04] dark:ring-white/[0.05]',
              'transition-transform duration-150 group-hover:scale-[1.03]',
              cfg.iconBg,
            )}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/[0.03]" />

            {loading ? (
              <Skeleton className="h-5 w-5 rounded-md" />
            ) : (
              <Icon className={cn('relative z-10 h-[18px] w-[18px]', cfg.iconColor)} />
            )}
          </div>
        </div>

        {/* Progress */}
        {progress !== undefined && (
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-1 w-full rounded-full" />
            ) : (
              <Progress
                value={progress}
                className={cn(
                  'h-1 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-white/[0.05]',
                  cfg.progress,
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}