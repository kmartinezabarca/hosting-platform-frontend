import React, { useState, useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import ReactCountryFlag from 'react-country-flag';
import { Check, ChevronsUpDown, Phone } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import { phoneCountries, getPhonePrefix } from '@shared/utils/phoneCountries';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  onCountryChange?: (countryCode: string) => void;
  selectedCountry: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente de entrada de teléfono con selector de país integrado.
 * Automáticamente agrega el prefijo del país seleccionado.
 */
const PhoneInput = ({
  value,
  onChange,
  onCountryChange,
  selectedCountry,
  placeholder = "Número de teléfono",
  error,
  disabled = false,
  className,
}: PhoneInputProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountryData = useMemo(
    () => phoneCountries.find(c => c.code === selectedCountry) || phoneCountries[0],
    [selectedCountry]
  );

  const prefix = getPhonePrefix(selectedCountry);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Si el usuario intenta escribir el prefijo, lo removemos para que no se duplique
    if (prefix && inputValue.startsWith(prefix)) {
      inputValue = inputValue.slice(prefix.length);
    }
    
    onChange(inputValue);
  };

  const handleCountrySelect = (countryCode: string) => {
    onCountryChange?.(countryCode);
    setIsOpen(false);
  };

  // Mostrar el número con el prefijo en el input
  const displayValue = prefix && value ? `${prefix} ${value}` : value;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-foreground">
        Teléfono
      </label>
      
      <div className="flex gap-2">
        {/* Selector de País */}
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              disabled={disabled}
              className={cn(
                "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border",
                "bg-card border-border hover:border-border/80",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
                "transition-colors min-w-fit",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-label={`País seleccionado: ${selectedCountryData.name}`}
            >
              <ReactCountryFlag
                countryCode={selectedCountryData.code}
                svg
                style={{ width: '1.25rem', height: '1.25rem', borderRadius: '3px' }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                {prefix}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={5}
              className="w-80 bg-card border border-border rounded-lg shadow-lg p-2 z-50"
              align="start"
            >
              <DropdownMenu.Group className="max-h-60 overflow-y-auto">
                {phoneCountries.map((country) => (
                  <DropdownMenu.Item
                    key={country.code}
                    onSelect={() => handleCountrySelect(country.code)}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <span className="flex items-center gap-3 flex-1">
                      <ReactCountryFlag
                        countryCode={country.code}
                        svg
                        style={{ width: '1.25rem', height: '1.25rem', borderRadius: '3px' }}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{country.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{country.prefix}</span>
                    </span>
                    {selectedCountry === country.code && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Input de Teléfono */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2.5 pl-10 rounded-lg border",
              "bg-card border-border hover:border-border/80",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
              "transition-colors placeholder:text-muted-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500 focus:ring-red-500/50"
            )}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
