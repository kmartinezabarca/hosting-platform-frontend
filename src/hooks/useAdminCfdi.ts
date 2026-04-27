import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import adminCfdiService from '@/services/adminCfdiService';

interface CfdiItem {
  id: number | string;
  folio?: string;
  [key: string]: unknown;
}

interface CfdiListResult {
  data: CfdiItem[];
  meta: unknown | null;
}

interface CfdiStats {
  [key: string]: unknown;
}

interface CancelCfdiVars {
  id: number | string;
  [key: string]: unknown;
}

interface DownloadCfdiVars {
  id: number | string;
  format: 'pdf' | 'xml';
  folio?: string;
}

const CFDI_KEYS = {
  list:   (p: unknown): unknown[] => ['admin', 'cfdi', 'list', p],
  stats:  ['admin', 'cfdi', 'stats'],
  detail: (id: number | string): unknown[] => ['admin', 'cfdi', id],
};

/** Lista paginada de CFDI con filtros */
export function useAdminCfdis(params: Record<string, unknown> = {}): UseQueryResult<CfdiListResult> {
  return useQuery({
    queryKey: CFDI_KEYS.list(params),
    queryFn: () => adminCfdiService.getCfdis(params),
    select: (data: unknown) => {
      const d = data as Record<string, unknown>;
      return {
        data: (d?.data as Record<string, unknown>)?.data as CfdiItem[] ?? d?.data as CfdiItem[] ?? [],
        meta: (d?.data as Record<string, unknown>)?.meta ?? null,
      };
    },
    staleTime: 30_000,
  });
}

/** Stats de CFDI por estado — se refresca automáticamente cada minuto */
export function useAdminCfdiStats(): UseQueryResult<CfdiStats> {
  return useQuery({
    queryKey: CFDI_KEYS.stats,
    queryFn: () => adminCfdiService.getStats(),
    select: (data: unknown) => {
      const d = data as Record<string, unknown>;
      return (d?.data ?? data) as CfdiStats;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

/** Reintentar timbrado */
export function useRetryCfdi(): UseMutationResult<unknown, Error, number | string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => adminCfdiService.retry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'cfdi'] }),
  });
}

/** Cancelar CFDI con motivo SAT */
export function useCancelCfdi(): UseMutationResult<unknown, Error, CancelCfdiVars> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: CancelCfdiVars) => adminCfdiService.cancel(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'cfdi'] }),
  });
}

/** Descarga programática de PDF o XML */
export function useDownloadAdminCfdi(): UseMutationResult<void, Error, DownloadCfdiVars> {
  return useMutation({
    mutationFn: async ({ id, format, folio }: DownloadCfdiVars) => {
      const blob = format === 'pdf'
        ? await adminCfdiService.downloadPdf(id)
        : await adminCfdiService.downloadXml(id);
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cfdi-${folio ?? id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}
