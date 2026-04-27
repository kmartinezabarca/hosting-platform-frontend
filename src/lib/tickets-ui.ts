import type { TicketStatus, TicketPriority } from '@/types/models';

type StatusKey = TicketStatus | 'default';
type PriorityKey = TicketPriority | 'default';
type CategoryKey = 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report' | string;

export const BADGE_CLASSES: {
  status: Record<StatusKey, string>;
  priority: Record<PriorityKey, string>;
} = {
  status: {
    open:             'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    in_progress:      'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    waiting_customer: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    closed:           'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    pending:          'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    default:          'bg-muted/20 text-muted-foreground',
  },
  priority: {
    urgent:  'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    high:    'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    medium:  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    low:     'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    default: 'bg-muted/20 text-muted-foreground',
  },
};

const STATUS_TEXT: Record<string, string> = {
  open:             'Abierto',
  in_progress:      'En Progreso',
  waiting_customer: 'Esperando respuesta',
  closed:           'Cerrado',
  pending:          'Pendiente',
};

const PRIORITY_TEXT: Record<string, string> = {
  urgent: 'Urgente',
  high:   'Alta',
  medium: 'Media',
  low:    'Baja',
};

const CATEGORY_TEXT: Record<string, string> = {
  technical:       'Técnico',
  billing:         'Facturación',
  general:         'General',
  feature_request: 'Función',
  bug_report:      'Bug',
};

export const statusText   = (s: TicketStatus | string): string => STATUS_TEXT[s]   ?? 'Desconocido';
export const priorityText = (p: TicketPriority | string): string => PRIORITY_TEXT[p] ?? 'Media';
export const categoryText = (c: CategoryKey): string             => CATEGORY_TEXT[c] ?? 'General';

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-MX', {
    day:    '2-digit',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  });
