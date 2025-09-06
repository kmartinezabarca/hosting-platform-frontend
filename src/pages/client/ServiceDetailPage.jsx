import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useServiceDetails } from '../../hooks/useServices';
import { Skeleton } from '../../components/ui/skeleton';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

// --- Importamos todos nuestros nuevos componentes ---
import ServiceDetailHeader from '../../components/services/details/ServiceDetailHeader';
import GeneralInfoCard from '../../components/services/details/GeneralInfoCard';
import SpecificationsCard from '../../components/services/details/SpecificationsCard';
import PerformanceCard from '../../components/services/details/PerformanceCard';
import QuickActionsCard from '../../components/services/details/QuickActionsCard';
import PaymentHistory from '../../components/services/details/PaymentHistory'; // Asumimos que este ya existe
import InfoCard from '../../components/services/details/InfoCard';

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const { data: service, isLoading, isError, error } = useServiceDetails(serviceId);

  if (isLoading) {
    // El skeleton ahora puede ser un componente separado también si se desea
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-24 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8"><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></div>
          <div className="lg:col-span-2 space-y-8"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="w-16 h-16 text-destructive/50" />
        <h2 className="mt-4 text-2xl font-bold">Error al Cargar el Servicio</h2>
        <p className="mt-2 max-w-md text-muted-foreground">{error?.message || 'Ocurrió un error inesperado.'}</p>
        <Link to="/client/services" className="mt-8 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
          <ArrowLeft className="w-4 h-4 inline-block mr-2" />
          Volver a Mis Servicios
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ServiceDetailHeader service={service} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
        {/* Columna Izquierda */}
        <div className="lg:col-span-3 space-y-8">
          <GeneralInfoCard service={service} />
          <InfoCard title="Historial de Pagos" subtitle="Movimientos recientes de este servicio">
            <PaymentHistory serviceId={service.uuid} />
          </InfoCard>
          <QuickActionsCard service={service} />
        </div>

        {/* Columna Derecha */}
        <div className="lg:col-span-2 space-y-8">
          <SpecificationsCard specs={service.plan?.specifications} />
          <PerformanceCard metrics={service.metrics} />
          {/* Podríamos añadir la tarjeta de Features aquí también si quisiéramos */}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
