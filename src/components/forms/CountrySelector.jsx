import React, { useState, useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import ReactCountryFlag from 'react-country-flag';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils'; // Asegúrate de que la ruta sea correcta

// Lista de países. En una aplicación real, esto podría venir de una API o un archivo JSON.
const countries = [
  { code: 'MX', name: 'México' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
  { code: 'CO', name: 'Colombia' },
  { code: 'AR', name: 'Argentina' },
  // ... añade más países según necesites
];

/**
 * Un selector de países personalizado, moderno y reutilizable.
 * Reemplaza el <select> nativo por una experiencia de usuario superior.
 *
 * @param {object} props
 * @param {string} props.value - El código del país seleccionado (ej. "MX").
 * @param {function} props.onChange - Callback que se ejecuta con el nuevo código de país.
 * @param {string} [props.className] - Clases adicionales para el botón principal.
 */
const CountrySelector = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  // useMemo para evitar recalcular el país seleccionado en cada render.
  const selectedCountry = useMemo(
    () => countries.find(c => c.code === value) || countries[0],
    [value]
  );

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* El botón que el usuario ve y con el que interactúa */}
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            // Estilos base del botón, consistentes con otros inputs
            'w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg border border-border bg-card',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
            'transition-colors',
            className
          )}
          aria-label={`País seleccionado: ${selectedCountry.name}`}
        >
          <span className="flex items-center gap-3">
            <ReactCountryFlag
              countryCode={selectedCountry.code}
              svg
              style={{ width: '1.5rem', height: '1.5rem', borderRadius: '4px' }}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">{selectedCountry.name}</span>
          </span>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      {/* El portal asegura que el menú se renderice por encima de otros elementos */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border border-border rounded-lg shadow-lg p-2 z-50"
          align="start"
        >
          <DropdownMenu.Group className="max-h-60 overflow-y-auto">
            {countries.map((country) => (
              <DropdownMenu.Item
                key={country.code}
                onSelect={() => {
                  onChange(country.code);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted focus:bg-muted focus:outline-none"
              >
                <span className="flex items-center gap-3">
                  <ReactCountryFlag
                    countryCode={country.code}
                    svg
                    style={{ width: '1.25rem', height: '1.25rem', borderRadius: '3px' }}
                    aria-hidden="true"
                  />
                  <span>{country.name}</span>
                </span>
                {value === country.code && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CountrySelector;