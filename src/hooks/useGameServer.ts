import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/services/serviceService';
import type {
  GameServerProperties,
  UpdateGameServerSoftwarePayload,
} from '@/services/serviceService';

/** Polling de métricas en tiempo real para game servers (cada 30s) */
export function useGameServerUsage(serviceUuid: string, enabled = true) {
  return useQuery({
    queryKey: ['gameServer', 'usage', serviceUuid],
    queryFn: () => servicesService.getServiceUsage(serviceUuid),
    select: (data) => data?.data ?? data,
    enabled: !!serviceUuid && enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: false,
  });
}

/** List Nest Eggs */
export function useNestEggs(nestID: number, enabled = true) {
  return useQuery({
    queryKey: ['nest', 'eggs'],
    queryFn: () => servicesService.getNestEggs(nestID),
    select: (data) => data?.data ?? [],
    enabled: enabled,
    staleTime: 10 * 60_000,
    retry: false,
  });
}

export function useGameServerSoftwareOptions(serviceUuid: string, enabled = true) {
  return useQuery({
    queryKey: ['gameServer', 'softwareOptions', serviceUuid],
    queryFn: () => servicesService.getGameServerSoftwareOptions(serviceUuid),
    select: (data) => data?.data ?? [],
    enabled: !!serviceUuid && enabled,
    staleTime: 10 * 60_000,
    retry: false,
  });
}

export function useGameServerConfiguration(serviceUuid: string, enabled = true) {
  return useQuery({
    queryKey: ['gameServer', 'configuration', serviceUuid],
    queryFn: () => servicesService.getGameServerConfiguration(serviceUuid),
    select: (data) => data?.data ?? data,
    enabled: !!serviceUuid && enabled,
    staleTime: 30_000,
    retry: false,
  });
}

export function useUpdateGameServerSoftware(serviceUuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateGameServerSoftwarePayload) =>
      servicesService.updateGameServerSoftware(serviceUuid, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gameServer', 'configuration', serviceUuid] });
      qc.invalidateQueries({ queryKey: ['service', serviceUuid] });
    },
  });
}

export function useUpdateGameServerProperties(serviceUuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (properties: Partial<GameServerProperties>) =>
      servicesService.updateGameServerProperties(serviceUuid, properties),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gameServer', 'configuration', serviceUuid] });
      qc.invalidateQueries({ queryKey: ['service', serviceUuid] });
    },
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
