import React from 'react';
import { useServiceInvoices } from '../../../hooks/useServices';
import { Skeleton } from '../../ui/skeleton';
import { FileText, CheckCircle, Clock } from 'lucide-react';

const InvoiceStatusBadge = ({ status }) => {
  const statusMap = {
    paid: { text: 'Pagado', icon: CheckCircle, color: 'text-green-500' },
    pending: { text: 'Pendiente', icon: Clock, color: 'text-yellow-500' },
    // ... otros estados
  };
  const current = statusMap[status] || { text: status, icon: FileText, color: 'text-muted-foreground' };
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${current.color}`}>
      <current.icon className="w-3.5 h-3.5" />
      {current.text}
    </span>
  );
};

const PaymentHistory = ({ serviceId }) => {
  const { data: invoices, isLoading, isError } = useServiceInvoices(serviceId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError || !invoices || invoices.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay historial de pagos para este servicio.</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-my-4 divide-y divide-border">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-foreground">Factura #{invoice.invoice_number}</p>
              <p className="text-xs text-muted-foreground">
                Emitida: {new Date(invoice.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">${invoice.total}</p>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentHistory;
