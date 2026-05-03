// src/hooks/useServicesMetrics.ts

import { useQuery } from "@tanstack/react-query";
import { servicesService } from '@/services/serviceService';

/**
 * Trae las métricas de TODOS los game servers del usuario en una sola llamada.
 * Caché: 30s en el servidor, refetch cada 60s en el cliente.
 * Solo refetch cuando la pestaña está visible.
 */
export function useServicesMetrics(enabled = true) {
  return useQuery({
    queryKey: ["services", "metrics"],
    queryFn: () => servicesService.getAllServicesMetrics(),
    select: (data) => data?.data ?? data,
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Helper para obtener métricas de un servidor específico.
 * Usa el resultado del hook unificado.
 */
export function useServiceMetrics(serviceUuid: string, enabled = true) {
  const { data: allMetrics, isLoading, error } = useServicesMetrics(enabled);

  return {
    metrics: allMetrics?.[serviceUuid] ?? null,
    isLoading,
    error,
  };
}