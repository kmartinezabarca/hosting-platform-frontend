import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import adminGameServerService from '@/services/adminGameServerService';
import type { GameServer } from '@/types/models';

interface GameServerListResult {
  data: GameServer[];
  meta: unknown | null;
}

const GS_KEYS = {
  list:   (p: unknown): unknown[] => ['admin', 'game-servers', 'list', p],
  detail: (id: number | string): unknown[] => ['admin', 'game-servers', id],
};

/** Lista paginada de game servers con filtros */
export function useAdminGameServers(params: Record<string, unknown> = {}): UseQueryResult<GameServerListResult> {
  return useQuery({
    queryKey: GS_KEYS.list(params),
    queryFn: () => adminGameServerService.getGameServers(params),
    select: (data: unknown) => {
      const d = data as Record<string, unknown>;
      return {
        data: ((d?.data as Record<string, unknown>)?.data ?? d?.data ?? []) as GameServer[],
        meta: (d?.data as Record<string, unknown>)?.meta ?? null,
      };
    },
    staleTime: 30_000,
  });
}

/** Detalle de un game server */
export function useAdminGameServer(id: number | string): UseQueryResult<GameServer> {
  return useQuery({
    queryKey: GS_KEYS.detail(id),
    queryFn: () => adminGameServerService.getGameServer(id),
    select: (data: unknown) => {
      const d = data as Record<string, unknown>;
      return (d?.data ?? data) as GameServer;
    },
    enabled: !!id,
    staleTime: 20_000,
  });
}

/** Helper para crear mutation hooks de acciones admin */
function makeActionMutation(
  mutFn: (id: number | string) => Promise<unknown>
): () => UseMutationResult<unknown, Error, number | string> {
  return function () {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: mutFn,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'game-servers'] }),
    });
  };
}

export const useProvisionGameServer  = makeActionMutation((id) => adminGameServerService.provision(id));
export const useSuspendGameServer    = makeActionMutation((id) => adminGameServerService.suspend(id));
export const useUnsuspendGameServer  = makeActionMutation((id) => adminGameServerService.unsuspend(id));
export const useReinstallGameServer  = makeActionMutation((id) => adminGameServerService.reinstall(id));
export const useDeleteGameServer     = makeActionMutation((id) => adminGameServerService.delete(id));
