import React from 'react';
import InfoCard from './InfoCard';

const PerformanceBar = ({ label, value, barClass, textClass }) => {
  const getMetricColors = (v) => {
    if (v < 50) return { bar: "bg-green-500", text: "text-green-500" };
    if (v < 80) return { bar: "bg-yellow-500", text: "text-yellow-500" };
    return { bar: "bg-red-500", text: "text-red-500" };
  };
  
  const v = Number(value) || 0;
  const colors = barClass && textClass ? { bar: barClass, text: textClass } : getMetricColors(v);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-sm font-semibold ${colors.text}`}>{v}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div className={`h-2 ${colors.bar}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
};

const PerformanceCard = ({ metrics }) => {
  // Los datos de métricas vendrían de una API en el futuro.
  // Por ahora, usamos datos simulados si no llegan.
  const displayMetrics = metrics || { cpu: 44, memory: 43, disk: 26 };

  return (
    <InfoCard title="Métricas de Rendimiento" subtitle="Uso estimado del servicio">
      <div className="space-y-4">
        <PerformanceBar label="CPU" value={displayMetrics.cpu} />
        <PerformanceBar label="Memoria" value={displayMetrics.memory} />
        <PerformanceBar label="Disco" value={displayMetrics.disk} />
      </div>
    </InfoCard>
  );
};

export default PerformanceCard;
