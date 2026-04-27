import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Globe, Server, Database, Users } from 'lucide-react';

const ICON_MAP = { Globe, Server, Database, Users };
const getCategoryIcon = (name) => ICON_MAP[name] || Server;

const ServiceDetailHeader = ({ service }) => {
  const category = service?.plan?.category;
  const CatIcon = getCategoryIcon(category?.icon);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="min-w-0">
        <Link
          to="/client/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis Servicios
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-foreground tracking-tight truncate">
            {service.name}
          </h1>
          {category && (
            <span
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-black/10 dark:ring-white/10 ${category.bg_color} ${category.color}`}
              title={category.description}
            >
              <CatIcon className="w-4 h-4" />
              {category.name}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">{service.plan?.name || "Plan"}</p>
      </div>
      <Link
        to={`/client/services/${service.uuid}/manage`}
        className="inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 bg-muted text-foreground hover:bg-muted/80 transition-all"
      >
        <Settings className="w-4 h-4" />
        Configuración Avanzada
      </Link>
    </div>
  );
};

export default ServiceDetailHeader;
