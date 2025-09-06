import React from 'react';
import InfoCard from './InfoCard';
import InfoRow from './InfoRow';
import StatusIndicator from './StatusIndicator';
import AutoRenewToggle from '../../services/details/AutoRenewToggle'; // Asumimos que ya existe
import { translateBillingCycle } from '../../../lib/translations'; // Asumimos que ya existe

const GeneralInfoCard = ({ service }) => {
  const currency = String(service?.currency ?? 'MXN').toUpperCase();

  return (
    <InfoCard title="Información General">
      <div className="space-y-1">
        <InfoRow label="Estado"><StatusIndicator status={service.status} /></InfoRow>
        <InfoRow label="Dominio"><span>{service.domain || "N/A"}</span></InfoRow>
        <InfoRow label="Dirección IP"><span>{service.ip_address || "N/A"}</span></InfoRow>
        <InfoRow label="Plan"><span>{service.plan?.name || "—"}</span></InfoRow>
        <InfoRow label="Precio"><span>${service.price ?? service.plan?.price} {currency}</span></InfoRow>
        <InfoRow label="Ciclo de facturación"><span className="capitalize">{translateBillingCycle(service.billing_cycle)}</span></InfoRow>
        <InfoRow label="Próxima factura"><span>{service.next_due_date ? new Date(service.next_due_date).toLocaleDateString("es-ES") : "—"}</span></InfoRow>
        <InfoRow label="Renovación"><AutoRenewToggle service={service} /></InfoRow>
      </div>
    </InfoCard>
  );
};

export default GeneralInfoCard;
