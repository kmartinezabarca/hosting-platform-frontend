/**
 * Traduce términos de ciclos de facturación de inglés a español.
 * Si no se encuentra una traducción, devuelve el término original con la primera letra en mayúscula.
 *
 * @param {string} billingCycle - El ciclo de facturación en inglés (ej. "monthly").
 * @returns {string} El ciclo de facturación traducido (ej. "Mensual").
 */
export const translateBillingCycle = (billingCycle) => {
  // Diccionario de traducciones. Usamos minúsculas para una comparación segura.
  const translations = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annually: 'Anual',
    // Puedes añadir más traducciones aquí en el futuro
    // "biennially": "Bienal",
    // "weekly": "Semanal",
  };

  const lowerCaseCycle = billingCycle?.toLowerCase() || '';

  return translations[lowerCaseCycle] || billingCycle;
};

