import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/services/serviceService';

export function useGameServerStartup(serviceUuid: string, enabled = true) {
  return useQuery({
    queryKey: ['gameServer', 'startup', serviceUuid],
    queryFn: () => servicesService.getGameServerStartupCommand(serviceUuid),
    select: (data) => data?.data ?? data,
    enabled: !!serviceUuid && enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });
}