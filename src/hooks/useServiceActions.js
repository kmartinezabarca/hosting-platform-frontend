import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import servicesService from '../services/serviceService';
import { useToast } from '@/components/ToastProvider';

const generateMockMetrics = (status) => {
  const s = (status || '').toLowerCase();
  const base = s === 'active' ? 35 : s === 'pending' ? 20 : s === 'suspended' ? 10 : 15;
  return { cpu: Math.min(95, base + 9), memory: Math.min(95, base + 8), disk: Math.min(95, base - 9) };
};

const nextStatusFor = (action) => (action === 'stop' ? 'suspended' : (action === 'start' || action === 'restart') ? 'active' : null);

// Helpers para lidiar con el shape del cache
const asArray = (raw) => (Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []);
const withArray = (raw, arr) => (Array.isArray(raw) ? arr : Array.isArray(raw?.data) ? { ...raw, data: arr } : raw);

export const useServiceActions = () => {
  const qc = useQueryClient();
  const { toast } = (useToast?.() ?? { toast: () => {} });
  const [actionLoading, setActionLoading] = useState({});

  const mutation = useMutation({
    mutationFn: async ({ serviceId, action }) => {
      let res;
      switch (action) {
        case 'start':
        case 'restart':
          res = await servicesService.reactivateService(serviceId);
          break;
        case 'stop':
          res = await servicesService.suspendService(serviceId, 'Detenido por el usuario');
          break;
        default:
          throw new Error(`Acción no soportada: ${action}`);
      }
      if (!res?.success) throw new Error(res?.message || 'Error al realizar la acción');
      return res;
    },

    onMutate: async ({ serviceId, action }) => {
      const key = `${serviceId}-${action}`;
      setActionLoading((m) => ({ ...m, [key]: true }));

      await qc.cancelQueries({ queryKey: ['userServices'] });
      const previousRaw = qc.getQueryData(['userServices']);      // <-- podría ser objeto o array
      const list = asArray(previousRaw);                           // <-- siempre array

      const newStatus = nextStatusFor(action);
      const optimisticList = newStatus
        ? list.map((s) =>
            s.id === serviceId
              ? { ...s, status: newStatus, metrics: generateMockMetrics(newStatus) }
              : s
          )
        : list;

      // Escribimos al cache respetando el shape original
      qc.setQueryData(['userServices'], withArray(previousRaw, optimisticList));

      return { previousRaw, key };
    },

    onSuccess: (_data, { action }) => {
      const map = { start: 'iniciado', restart: 'reiniciado', stop: 'suspendido' };
      toast?.({ title: 'Acción aplicada', description: `Servicio ${map[action]}.`, variant: 'success' });
    },

    onError: (err, _vars, ctx) => {
      // rollback
      if (ctx?.previousRaw !== undefined) qc.setQueryData(['userServices'], ctx.previousRaw);
      toast?.({
        title: 'No se pudo aplicar la acción',
        description: err?.message || 'Intenta de nuevo más tarde.',
        variant: 'destructive',
      });
    },

    onSettled: (_data, _error, _vars, ctx) => {
      if (ctx?.key) {
        setActionLoading((m) => {
          const copy = { ...m };
          delete copy[ctx.key];
          return copy;
        });
      }
      qc.invalidateQueries({ queryKey: ['userServices'] });
    },
  });

  const handleServiceAction = useCallback(
    (serviceId, action) => mutation.mutate({ serviceId, action }),
    [mutation]
  );

  const isProcessing = useCallback(
    (serviceId, action) => !!actionLoading[`${serviceId}-${action}`] || mutation.isPending,
    [actionLoading, mutation.isPending]
  );

  return { handleServiceAction, actionLoading, isProcessing };
};
