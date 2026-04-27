import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { InvoiceStatus, TransactionStatus } from '@/types/models';

type AnyStatus = InvoiceStatus | TransactionStatus | string;

/**
 * Returns Tailwind class string for a status badge (text + background colour).
 */
export const getStatusColor = (status: AnyStatus): string => {
  switch (status) {
    case 'paid':
    case 'completed':
      return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
    case 'sent':
    case 'pending':
      return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
    case 'overdue':
    case 'failed':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
    case 'cancelled':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    case 'refunded':
      return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
  }
};

/**
 * Returns the Lucide icon component for a given status.
 */
export const getStatusIcon = (status: AnyStatus): React.ReactElement => {
  const commonProps = { className: 'w-4 h-4' };
  switch (status) {
    case 'paid':
    case 'completed':
      return React.createElement(CheckCircle, commonProps);
    case 'sent':
    case 'pending':
      return React.createElement(Clock, commonProps);
    case 'overdue':
    case 'failed':
      return React.createElement(XCircle, commonProps);
    case 'cancelled':
      return React.createElement(AlertCircle, commonProps);
    default:
      return React.createElement(Clock, commonProps);
  }
};

const STATUS_TEXT: Record<string, string> = {
  draft:      'Borrador',
  sent:       'Enviada',
  paid:       'Pagada',
  overdue:    'Vencida',
  cancelled:  'Cancelada',
  refunded:   'Reembolsada',
  pending:    'Pendiente',
  processing: 'Procesando',
  completed:  'Completada',
  failed:     'Fallida',
};

/**
 * Translates status keys into user-friendly Spanish labels.
 */
export const getStatusText = (status: AnyStatus): string =>
  STATUS_TEXT[status] ?? 'Desconocido';

/**
 * Formats a numeric amount as a currency string in Mexican pesos by default.
 */
export const formatCurrency = (amount: number, currency = 'MXN'): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

/**
 * Formats an ISO date string into a human-friendly Spanish date.
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-MX', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });
};
