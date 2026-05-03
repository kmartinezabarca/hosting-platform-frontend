import { useQueryClient, useMutation } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

interface RestartState {
  restart_required: boolean;
  pending_changes_count: number;
}

export function useRestartState(serviceUuid: string) {
  const qc = useQueryClient();

  const service = qc.getQueryData<any>(["service", serviceUuid]);

  const data: RestartState = {
    restart_required: service?.restart_required,
    pending_changes_count: service?.pending_changes_count,
  };

  const { mutateAsync: markPending, isPending } = useMutation({
    mutationFn: () =>
      apiClient.post(`/services/${serviceUuid}/game-server/restart-required`),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service", serviceUuid] });
    },
  });

  return {
    restartRequired: data.restart_required,
    pendingCount: data.pending_changes_count,
    markPending,
    isMarking: isPending,
  };
}