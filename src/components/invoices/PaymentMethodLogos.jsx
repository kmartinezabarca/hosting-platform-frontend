import React from 'react';

const LOGO_FILES = {
  visa: 'visa.svg',
  mastercard: 'mastercard.svg',
  amex: 'amex.svg',
  nu: 'nu.svg',
  // discover: 'discover.svg', 
};

/**
 * Componente que muestra el logo de un método de pago.
 * Carga un archivo SVG desde la carpeta /public/brands/ basado en la marca.
 * 
 * @param {object} props
 * @param {string} props.brand
 * @param {string} props.className
 * @param {string} [props.cardName='Card']
 */
export const PaymentMethodLogo = ({ brand, className, cardName = 'Card', ...props }) => {
  const brandKey = (brand || '').toLowerCase();
  const logoFile = LOGO_FILES[brandKey];

  if (logoFile) {
    return (
      <img
        src={`/brands/${logoFile}`}
        alt={`${brand} logo`}
        className={className}
        {...props}
      />
    );
  }

  return (
    <span className="text-lg font-semibold tracking-wide">
      {brand || cardName}
    </span>
  );
};
