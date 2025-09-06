import React from 'react';
import InfoCard from './InfoCard';
import InfoRow from './InfoRow';

const SpecificationsCard = ({ specs }) => {
  if (!specs || Object.keys(specs).length === 0) return null;

  return (
    <InfoCard title="Especificaciones" subtitle="Detalles del plan actual">
      <div className="space-y-1">
        {Object.entries(specs).map(([key, value]) => (
          <InfoRow key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}>
            <span>{value}</span>
          </InfoRow>
        ))}
      </div>
    </InfoCard>
  );
};

export default SpecificationsCard;
