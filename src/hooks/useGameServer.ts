import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/services/serviceService';

/** Polling de métricas en tiempo real para game servers (cada 5s) */
export function useGameServerUsage(serviceUuid, enabled = true) {
  return useQuery({
    queryKey: ['gameServer', 'usage', serviceUuid],
    queryFn: () => servicesService.getServiceUsage(serviceUuid),
    select: (data) => data?.data ?? data,
    enabled: !!serviceUuid && enabled,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: false,
  });
}

/** Control de energía: start | stop | restart | kill */
export function useGameServerPower(serviceUuid) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (signal: 'restart' | 'stop' | 'start' | 'kill') => servicesService.sendPowerSignal(serviceUuid, signal),
    onSuccess: () => {
      // Invalidar métricas para que el polling recoja el nuevo estado
      qc.invalidateQueries({ queryKey: ['gameServer', 'usage', serviceUuid] });
    },
  });
}
