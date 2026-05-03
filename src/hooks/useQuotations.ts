import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import quotationService, {
  type QuotationListParams,
  type QuotationCreatePayload,
  type QuotationUpdatePayload,
} from '@/services/quotationService';

// ── Query keys ───────────────────────────────────────────────────────────────

export const quotationKeys = {
  all:     ['quotations'] as const,
  lists:   () => [...quotationKeys.all, 'list'] as const,
  list:    (filters: unknown) => [...quotationKeys.lists(), filters] as const,
  details: () => [...quotationKeys.all, 'detail'] as const,
  detail:  (uuid: string) => [...quotationKeys.details(), uuid] as const,
  public:  (token: string) => ['quotation-public', token] as const,
};

// ── Admin hooks ───────────────────────────────────────────────────────────────

/** List quotations with optional filters */
export const useQuotations = (params: QuotationListParams = {}) => {
  return useQuery({
    queryKey: quotationKeys.list(params),
    queryFn:  () => quotationService.getAll(params),
    staleTime: 60_000,
    select: (data: any) => {
      // Handle { success, data: { data: [], ...pagination } }
      if (data?.success && data?.data) {
        const inner = data.data;
        return {
          quotations: (inner.data ?? inner ?? []) as any[],
          pagination: {
            current_page: inner.current_page ?? 1,
            last_page:    inner.last_page    ?? 1,
            per_page:     inner.per_page     ?? 15,
            total:        inner.total        ?? 0,
          },
        };
      }
      // Fallback: plain array
      const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      return { quotations: arr, pagination: null };
    },
  });
};

/** Get single quotation by uuid */
export const useQuotation = (uuid: string) => {
  return useQuery({
    queryKey: quotationKeys.detail(uuid),
    queryFn:  () => quotationService.getById(uuid),
    enabled:  !!uuid,
    select:   (data: any) => data?.data ?? data,
  });
};

/** Create quotation */
export const useCreateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: QuotationCreatePayload) => quotationService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
};

/** Update quotation */
export const useUpdateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: QuotationUpdatePayload }) =>
      quotationService.update(uuid, data),
    onSuccess: (_res, { uuid }) => {
      qc.invalidateQueries({ queryKey: quotationKeys.lists() });
      qc.invalidateQueries({ queryKey: quotationKeys.detail(uuid) });
    },
  });
};

/** Delete quotation */
export const useDeleteQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => quotationService.delete(uuid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
};

/**
 * Send quotation to client — sets status to "sent" and generates the 72-h link
 */
export const useSendQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => quotationService.send(uuid),
    onSuccess: (_res, uuid) => {
      qc.invalidateQueries({ queryKey: quotationKeys.lists() });
      qc.invalidateQueries({ queryKey: quotationKeys.detail(uuid) });
    },
  });
};

/** Regenerate / extend the public link */
export const useRegenerateQuotationLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => quotationService.regenerateLink(uuid),
    onSuccess: (_res, uuid) => {
      qc.invalidateQueries({ queryKey: quotationKeys.lists() });
      qc.invalidateQueries({ queryKey: quotationKeys.detail(uuid) });
    },
  });
};

// ── Public hook ───────────────────────────────────────────────────────────────

/** Fetch quotation by public token (no auth required) */
export const usePublicQuotation = (token: string) => {
  return useQuery({
    queryKey: quotationKeys.public(token),
    queryFn:  () => quotationService.getPublic(token),
    enabled:  !!token,
    retry:    false,
    select:   (data: any) => data?.data ?? data,
  });
};
