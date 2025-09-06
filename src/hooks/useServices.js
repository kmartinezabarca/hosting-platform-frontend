import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '../services/serviceService';

// Hook para obtener los detalles de UN solo servicio
export const useServiceDetails = (serviceId) => {
  return useQuery({
    queryKey: ['services', 'detail', serviceId],
    queryFn: () => servicesService.getServiceDetails(serviceId),
    enabled: !!serviceId,
    select: (data) => data.data,
  });
};


export const useServiceInvoices = (serviceId) => {
  return useQuery({
    queryKey: ['services', 'invoices', serviceId],
    queryFn: () => servicesService.getServiceInvoices(serviceId),
    enabled: !!serviceId,
    select: (response) => response.data,
  });
};

export const useUpdateServiceConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, config }) => servicesService.updateServiceConfiguration(serviceId, config),
    onSuccess: (data) => {
      const serviceId = data.data.uuid;
      queryClient.invalidateQueries({ queryKey: ['services', 'detail', serviceId] });
      // Aquí podrías mostrar una notificación de éxito (toast)
    },
    onError: (error) => {
      console.error("Error al actualizar la configuración:", error);
    },
  });
};

const mapCategoryToType = (category) => {
  const c = (category || '').toLowerCase();
  const map = {
    hosting: 'shared_hosting',
    vps: 'vps',
    cloud: 'vps',
    gameserver: 'game_server',
    database: 'database',
    db: 'database',
  };
  return map[c] || 'shared_hosting';
};

const parseSpecifications = (specs = {}, categorySlug = '') => ({
  email:     specs.email     ?? null,
  domains:   specs.domains   ?? null,
  storage:   specs.storage   ?? null,
  bandwidth: specs.bandwidth ?? null,
  _category: categorySlug || null,
});

// si aún no tienes métricas reales, deja esto como placeholder
const generateMockMetrics = (status) => {
  const s = (status || '').toLowerCase();
  const base = s === 'active' ? 35 : s === 'pending' ? 20 : s === 'suspended' ? 10 : 15;
  return {
    cpu: Math.min(95, base + 9),
    memory: Math.min(95, base + 8),
    disk: Math.min(95, base - 9),
  };
};

export const useUserServices = (options = {}) => {
  return useQuery({
    queryKey: ['userServices'],
    queryFn: () => servicesService.getUserServices(),
    select: (resp) => {
      const list = resp?.data ?? [];
      return list.map((service) => {
        const plan = service.plan || {};
        const category = plan.category || {};
        const conn = service.connection_details || {};

        const domain =
          conn.domain ??
          service.domain ??
          conn.ip_address ??
          'N/A';

        const ip = conn.ip_address ?? service.ip_address ?? 'N/A';
        const port = conn.port ?? null;

        const specs = parseSpecifications(plan.specifications || {}, category.slug);
        const metrics = generateMockMetrics(service.status);

        const price = Number(service.price ?? plan.price ?? plan.base_price ?? 0);
        const currency = String(service.currency ?? 'MXN').toUpperCase();

        return {
          id: service.id,
          uuid: service.uuid,
          name: service.name || plan.name || 'Servicio',
          type: mapCategoryToType(category.slug),
          status: service.status,
          domain,
          ip_address: ip,
          port,
          created_at: service.created_at,
          expires_at: service.next_due_date,
          specs,
          metrics,
          price,
          currency,
          billing_cycle: service.billing_cycle,
          plan_name: plan.name,
          plan_slug: plan.slug,
          category: category.name || category.slug || 'service',
          setup_fee: service.setup_fee ?? plan.setup_fee ?? 0,
          notes: service.notes ?? null,
        };
      });
    },
    staleTime: 5 * 60 * 1000,     // 5 min (igual que tu useServicePlans)
    cacheTime: 20 * 60 * 1000,    // 20 min
    refetchOnWindowFocus: false,
    ...options,
    onError: (error) => {
      console.error('Error al cargar servicios del usuario', error);
      options?.onError?.(error);
    },
  });
};


