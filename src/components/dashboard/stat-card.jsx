import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

// --- Este es tu componente reutilizable para las tarjetas de estadísticas ---

const StatCard = ({ icon: Icon, title, value, details, trend, colorClass, delay }) => {
  // Determina el color y el icono de la tendencia
  const trendInfo = {
    color: "text-muted-foreground",
    icon: <Activity className="w-4 h-4" />,
  };

  if (trend > 0) {
    trendInfo.color = "text-success";
    trendInfo.icon = <TrendingUp className="w-4 h-4" />;
  } else if (trend < 0) {
    trendInfo.color = "text-destructive";
    trendInfo.icon = <TrendingDown className="w-4 h-4" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      // --- DISEÑO BASE DE LA TARJETA ---
      // Fondo blanco/oscuro y borde definido para una apariencia profesional.
      className="bg-white dark:bg-card border border-border/80 rounded-2xl p-6 
                 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      {/* --- CABECERA DE LA TARJETA --- */}
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClass}/10`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        
        {/* Indicador de tendencia */}
        {typeof trend !== 'undefined' && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${trendInfo.color}`}>
            {trendInfo.icon}
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
          </div>
        )}
      </div>
      
      {/* --- CUERPO DE LA TARJETA --- */}
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        <p className="text-muted-foreground mt-1">{title}</p>
        {details && <p className="text-xs text-muted-foreground/80 mt-2">{details}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
