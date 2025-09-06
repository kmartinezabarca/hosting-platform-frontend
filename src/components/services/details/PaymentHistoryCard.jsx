import React from 'react';
import InfoCard from './InfoCard';
import PaymentHistory from './PaymentHistory'; // Importamos el componente que contiene la lógica

/**
 * Un componente de tarjeta que muestra el historial de pagos de un servicio.
 * Actúa como un contenedor para el componente PaymentHistory.
 *
 * @param {object} props
 * @param {string} props.serviceId - El UUID del servicio para obtener su historial de pagos.
 */
const PaymentHistoryCard = ({ serviceId }) => {
  return (
    <InfoCard
      title="Historial de Pagos"
      subtitle="Movimientos recientes asociados a este servicio"
    >
      <PaymentHistory serviceId={serviceId} />
    </InfoCard>
  );
};

export default PaymentHistoryCard;
