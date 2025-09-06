import React from 'react';
import InfoCard from './InfoCard';
import { CheckCircle } from 'lucide-react';

const FeaturesCard = ({ features }) => {
  if (!features || features.length === 0) {
    return null; // No renderizar la tarjeta si no hay características
  }

  return (
    <InfoCard title="Características Incluidas">
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {features.map((feature) => (
          <li key={feature.id} className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">{feature.feature}</span>
          </li>
        ))}
      </ul>
    </InfoCard>
  );
};

export default FeaturesCard;
