type BillingCycle = 'monthly' | 'quarterly' | 'annually' | string;

const BILLING_CYCLE_MAP: Record<string, string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  annually: 'Anual',
};

/**
 * Traduce términos de ciclos de facturación de inglés a español.
 * Si no se encuentra una traducción, devuelve el término original.
 */
export const translateBillingCycle = (billingCycle: BillingCycle): string => {
  const key = billingCycle?.toLowerCase() ?? '';
  return BILLING_CYCLE_MAP[key] ?? billingCycle;
};
