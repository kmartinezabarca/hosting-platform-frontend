// src/hooks/admin/useAdminAddOns.ts
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import addOnsService from '@/services/addOnsService';

interface AddOn {
  uuid: string;
  [key: string]: unknown;
}

interface ServicePlan {
  uuid: string;
  [key: string]: unknown;
}

interface NormalizedPage<T = unknown> {
  rows: T[];
  meta: {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  } | undefined;
  raw: unknown;
}

interface AddOnPayload {
  [key: string]: unknown;
}

interface UpdateAddOnVars {
  uuid: string;
  data: AddOnPayload;
}

interface AttachDetachVars {
  addOnUuid: string;
  payload: Record<string, unknown>;
}

interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
  onError?: (error: Error, variables: TVariables, context: unknown) => void;
  onSettled?: () => void;
}

const QK = {
  addOns: (params: Record<string, unknown>): unknown[] => ['admin', 'addOns', 'list', params || {}],
  addOn: (uuid: string): unknown[] => ['admin', 'addOns', 'detail', uuid],
  plans: (params: Record<string, unknown>): unknown[] => ['admin', 'servicePlans', params || {}],
};

/** Normaliza respuestas (paginadas o planas) a { rows, meta, raw } */
const normalizePage = (res: unknown): NormalizedPage => {
  // res aquí es lo que devuelve el service (normalmente { success, data, meta? })
  const raw = (res ?? {}) as Record<string, unknown>;

  // Cuando viene paginado estilo Laravel: res.data = { data: [...], current_page, ... }
  // Cuando viene plano: res.data = [...]  (o a veces res = [...])
  const container = (raw?.data ?? raw) as Record<string, unknown> | unknown[];

  const rows = Array.isArray((container as Record<string, unknown>)?.data)
    ? (container as Record<string, unknown>).data as unknown[] // paginado
    : Array.isArray(container)
    ? container      // arreglo plano
    : Array.isArray(raw)
    ? raw as unknown[]
    : [];

  const meta =
    (raw?.meta as NormalizedPage['meta']) ??
    (container && typeof container === 'object' && !Array.isArray(container)
      ? {
          current_page: (container as Record<string, unknown>).current_page as number | undefined,
          per_page: (container as Record<string, unknown>).per_page as number | undefined,
          total: (container as Record<string, unknown>).total as number | undefined,
          last_page: (container as Record<string, unknown>).last_page as number | undefined,
        }
      : undefined);

  return { rows, meta, raw };
};

/** Limpia params para no mandar undefined/null/'' al backend */
const cleanParams = (params: Record<string, unknown> = {}): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );

/* =========================
   QUERIES (Admin scope)
========================= */

// Lista de add-ons (admin)
export const useAdminAddOns = (
  params: Record<string, unknown> = {},
  options: Record<string, unknown> = {}
): UseQueryResult<NormalizedPage<any>> =>
  useQuery({
    queryKey: QK.addOns(params),
    queryFn: async () => {
      const cleaned = cleanParams(params);
      return addOnsService.getAddOns(cleaned);
    },
    select: normalizePage,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    ...options,
  }) as UseQueryResult<NormalizedPage<any>>;

// Detalle de un add-on (admin)
export const useAdminAddOn = (
  uuid: string,
  options: Record<string, unknown> = {}
): UseQueryResult<unknown> =>
  useQuery({
    queryKey: QK.addOn(uuid),
    queryFn: () => addOnsService.getAddOn(uuid),
    enabled: Boolean(uuid),
    // para detalle no normalizamos: el consumidor decide
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// Planes de servicio (admin)
export const useAdminServicePlans = (
  params: Record<string, unknown> = {},
  options: Record<string, unknown> = {}
): UseQueryResult<NormalizedPage<any>> =>
  useQuery({
    queryKey: QK.plans(params),
    queryFn: async () => {
      const cleaned = cleanParams(params);
      return addOnsService.getServicePlans(cleaned);
    },
    select: normalizePage,
    staleTime: 5 * 60 * 1000,
    ...options,
  }) as UseQueryResult<NormalizedPage<any>>;

/* =========================
   MUTATIONS (Admin scope)
========================= */

export const useAdminCreateAddOn = (
  options: MutationOptions<unknown, AddOnPayload> = {}
): UseMutationResult<unknown, Error, AddOnPayload> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddOnPayload) => addOnsService.createAddOn(payload),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    onSettled: () => {
      if (options.onSettled) {
        options.onSettled();
      }
    },
  });
};

export const useAdminUpdateAddOn = (
  options: MutationOptions<unknown, UpdateAddOnVars> = {}
): UseMutationResult<unknown, Error, UpdateAddOnVars> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: UpdateAddOnVars) => addOnsService.updateAddOn(uuid, data),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      if (variables?.uuid) qc.invalidateQueries({ queryKey: QK.addOn(variables.uuid) });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    onSettled: () => {
      if (options.onSettled) {
        options.onSettled();
      }
    },
  });
};

export const useAdminDeleteAddOn = (
  options: MutationOptions<unknown, string> = {}
): UseMutationResult<unknown, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => addOnsService.deleteAddOn(uuid),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    onSettled: () => {
      if (options.onSettled) {
        options.onSettled();
      }
    },
  });
};

export const useAdminAttachAddOnToPlan = (
  options: MutationOptions<unknown, AttachDetachVars> & Record<string, unknown> = {}
): UseMutationResult<unknown, Error, AttachDetachVars> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addOnUuid, payload }: AttachDetachVars) =>
      addOnsService.attachAddOnToPlan(addOnUuid, payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'servicePlans'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminDetachAddOnFromPlan = (
  options: MutationOptions<unknown, AttachDetachVars> & Record<string, unknown> = {}
): UseMutationResult<unknown, Error, AttachDetachVars> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addOnUuid, payload }: AttachDetachVars) =>
      addOnsService.detachAddOnFromPlan(addOnUuid, payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'servicePlans'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};
