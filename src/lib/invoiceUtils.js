import React from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

/**
 * Utility functions used across the invoices section. These helpers format
 * numbers and dates and provide metadata about invoice/transaction statuses.
 */

/**
 * Returns a Tailwind class string based on the given status. This determines
 * both text and background colours for status badges.
 *
 * @param {string} status The invoice or transaction status.
 * @returns {string} Tailwind classes for the badge.
 */
export const getStatusColor = (status) => {
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
 * Returns the appropriate Lucide icon component for a given status.
 * Icons are small (w-4 h-4) by default and can be styled via parent
 * components if needed.
 *
 * @param {string} status The invoice or transaction status.
 * @returns {React.ReactElement} A Lucide icon representing the status.
 */
export const getStatusIcon = (status) => {
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

/**
 * Translates status keys into user-friendly Spanish labels. This helper keeps
 * the mapping in a single place, making it easy to update or translate
 * statuses consistently across the app.
 *
 * @param {string} status The invoice or transaction status key.
 * @returns {string} A human‑readable Spanish string.
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'sent':
      return 'Enviada';
    case 'paid':
      return 'Pagada';
    case 'overdue':
      return 'Vencida';
    case 'cancelled':
      return 'Cancelada';
    case 'refunded':
      return 'Reembolsada';
    case 'pending':
      return 'Pendiente';
    case 'processing':
      return 'Procesando';
    case 'completed':
      return 'Completada';
    case 'failed':
      return 'Fallida';
    default:
      return 'Desconocido';
  }
};

/**
 * Formats a numeric amount as a currency string in Mexican pesos by default.
 *
 * @param {number} amount The numeric amount to format.
 * @param {string} currency ISO 4217 currency code. Defaults to 'MXN'.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Formats an ISO date string into a human friendly Spanish date. If the
 * provided value is falsy, an empty string is returned.
 *
 * @param {string|Date} date A date object or ISO date string.
 * @returns {string} The formatted date, e.g. "1 de enero de 2025".
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};