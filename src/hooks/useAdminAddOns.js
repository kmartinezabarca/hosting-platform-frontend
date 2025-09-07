// src/hooks/admin/useAdminAddOns.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import addOnsService from '@/services/addOnsService';

const QK = {
  addOns: (params) => ['admin', 'addOns', 'list', params || {}],
  addOn: (uuid) => ['admin', 'addOns', 'detail', uuid],
  plans: (params) => ['admin', 'servicePlans', params || {}],
};

/** Normaliza respuestas (paginadas o planas) a { rows, meta, raw } */
const normalizePage = (res) => {
  // res aquí es lo que devuelve el service (normalmente { success, data, meta? })
  const raw = res ?? {};

  // Cuando viene paginado estilo Laravel: res.data = { data: [...], current_page, ... }
  // Cuando viene plano: res.data = [...]  (o a veces res = [...])
  const container = raw?.data ?? raw;

  const rows = Array.isArray(container?.data)
    ? container.data // paginado
    : Array.isArray(container)
    ? container      // arreglo plano
    : Array.isArray(raw)
    ? raw
    : [];

  const meta =
    raw?.meta ??
    (container && typeof container === 'object'
      ? {
          current_page: container.current_page,
          per_page: container.per_page,
          total: container.total,
          last_page: container.last_page,
        }
      : undefined);

  return { rows, meta, raw };
};

/** Limpia params para no mandar undefined/null/'' al backend */
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );

/* =========================
   QUERIES (Admin scope)
========================= */

// Lista de add-ons (admin)
export const useAdminAddOns = (params = {}, options = {}) =>
  useQuery({
    queryKey: QK.addOns(params),
    queryFn: async () => {
      const cleaned = cleanParams(params);
      return addOnsService.getAddOns(cleaned);
    },
    select: normalizePage,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// Detalle de un add-on (admin)
export const useAdminAddOn = (uuid, options = {}) =>
  useQuery({
    queryKey: QK.addOn(uuid),
    queryFn: () => addOnsService.getAddOn(uuid),
    enabled: Boolean(uuid),
    // para detalle no normalizamos: el consumidor decide
    staleTime: 5 * 60 * 1000,
    ...options,
  });

// Planes de servicio (admin)
export const useAdminServicePlans = (params = {}, options = {}) =>
  useQuery({
    queryKey: QK.plans(params),
    queryFn: async () => {
      const cleaned = cleanParams(params);
      return addOnsService.getServicePlans(cleaned);
    },
    select: normalizePage,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

/* =========================
   MUTATIONS (Admin scope)
========================= */

export const useAdminCreateAddOn = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addOnsService.createAddOn(payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminUpdateAddOn = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }) => addOnsService.updateAddOn(uuid, data),
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      if (vars?.uuid) qc.invalidateQueries({ queryKey: QK.addOn(vars.uuid) });
      options.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useAdminDeleteAddOn = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid) => addOnsService.deleteAddOn(uuid),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminAttachAddOnToPlan = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addOnUuid, payload }) =>
      addOnsService.attachAddOnToPlan(addOnUuid, payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'servicePlans'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminDetachAddOnFromPlan = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addOnUuid, payload }) =>
      addOnsService.detachAddOnFromPlan(addOnUuid, payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['admin', 'addOns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'servicePlans'] });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};
