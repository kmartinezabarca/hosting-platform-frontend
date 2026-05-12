import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminGameServerService from '@infrastructure/services/adminGameServerService';

type PowerSignal = 'start' | 'stop' | 'restart' | 'kill';

/** Polling de métricas cada 5 s (solo cuando el servidor está activo) */
export const useAdminServerUsage = (id: number | string, enabled = true) =>
  useQuery({
    queryKey: ['admin', 'game-servers', id, 'usage'],
    queryFn:  () => adminGameServerService.getUsage(id),
    select:   (r: any) => r?.data ?? r,
    enabled,
    refetchInterval: 5_000,
    staleTime: 0,
    retry: false,
  });

/** Callback para obtener credenciales WS (lo llama GameServerConsole internamente) */
export const useAdminServerWebSocket = (id: number | string) =>
  useCallback(async () => {
    const res: any = await adminGameServerService.getWebSocket(id);
    // Normaliza: { data: { token, socket } }
    return res?.data ?? res;
  }, [id]);

/** Mutación de poder */
export const useAdminServerPower = (id: number | string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (signal: PowerSignal) => adminGameServerService.sendPower(id, signal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'game-servers', id, 'usage'] });
      qc.invalidateQueries({ queryKey: ['admin', 'game-servers', String(id)] });
    },
  });
};

/** Mutación de comando de consola */
export const useAdminServerCommand = (id: number | string) =>
  useMutation({
    mutationFn: (command: string) => adminGameServerService.sendCommand(id, command),
  });
