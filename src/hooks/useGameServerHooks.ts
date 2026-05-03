import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/services/serviceService';

export interface WsCredentials {
  token:  string;
  socket: string;
}

/** Polling de métricas en tiempo real para game servers (cada 5s) */
export function useGameServerUsage(serviceUuid: string, enabled = true) {
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
export function useGameServerPower(serviceUuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (signal: 'restart' | 'stop' | 'start' | 'kill') =>
      servicesService.sendPowerSignal(serviceUuid, signal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gameServer', 'usage', serviceUuid] });
    },
  });
}

/** Obtiene las credenciales WebSocket de Wings para la consola */
export function useGameServerWebSocket(serviceUuid: string) {
  return useCallback(async (): Promise<WsCredentials | null> => {
    try {
      const res = await servicesService.getGameServerWebSocket(serviceUuid);
      return res?.data ?? null;
    } catch {
      return null;
    }
  }, [serviceUuid]);
}