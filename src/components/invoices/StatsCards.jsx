import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../lib/invoiceUtils'; // Asumo que esta función existe

/**
 * Un componente de tarjeta de estadística individual, rediseñado para ser minimalista.
 *
 * @param {object} props
 * @param {string} props.title - El título de la tarjeta (ej. "Total Facturado").
 * @param {string|number} props.value - El valor principal a mostrar.
 * @param {React.ElementType} props.Icon - El componente de icono a usar.
 * @param {string} props.iconColorClass - La clase de color de Tailwind para el icono (ej. "text-primary").
 * @param {number} props.delay - El retraso para la animación de entrada.
 */
const StatCard = ({ title, value, Icon, iconColorClass, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.4, ease: 'easeOut' }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-px transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        {/* --- El cambio clave está aquí --- */}
        {/* Usamos un fondo 'muted' y solo cambiamos el color del icono */}
        <div className="p-3 bg-muted rounded-xl">
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
      </div>
    </motion.div>
  );
};


/**
 * Muestra un conjunto de tarjetas de estadísticas rediseñadas para ser más sutiles y
 * acordes con la línea de diseño del portal.
 *
 * @param {Object} props
 * @param {Object} props.invoiceStats - Estadísticas de facturas.
 * @param {number} props.paymentMethodCount - Número de métodos de pago.
 */
const StatsCards = ({ invoiceStats, paymentMethodCount }) => {
  const cardsData = [
    {
      title: 'Total Facturado',
      value: formatCurrency(invoiceStats?.total_amount || 0),
      Icon: Receipt,
      iconColorClass: 'text-black', // Usamos un color de texto, no de fondo
      delay: 0.1,
    },
    {
      title: 'Pagado',
      value: formatCurrency(invoiceStats?.paid_amount || 0),
      Icon: CheckCircle,
      iconColorClass: 'text-black',
      delay: 0.2,
    },
    {
      title: 'Pendiente',
      value: formatCurrency(invoiceStats?.pending_amount || 0),
      Icon: Clock,
      iconColorClass: 'text-black',
      delay: 0.3,
    },
    {
      title: 'Métodos de Pago',
      value: paymentMethodCount,
      Icon: CreditCard,
      iconColorClass: 'text-black',
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardsData.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          Icon={card.Icon}
          iconColorClass={card.iconColorClass}
          delay={card.delay}
        />
      ))}
    </div>
  );
};

export default StatsCards;