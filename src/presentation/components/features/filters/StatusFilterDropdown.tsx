import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Opciones del filtro. Podrían venir de una API o ser una constante.
const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'overdue', label: 'Vencidas' },
];

/**
 * Un componente de filtro de estado reutilizable y profesional,
 * construido con Radix UI y Framer Motion para una experiencia de usuario superior.
 *
 * @param {object} props
 * @param {string} props.value - El valor actualmente seleccionado.
 * @param {function(string): void} props.onChange - La función a llamar cuando se selecciona una nueva opción.
 */
const StatusFilterDropdown = ({ value, onChange, options = STATUS_OPTIONS }) => {
  const selectedLabel = options.find(opt => opt.value === value)?.label || 'Seleccionar estado';

  return (
    <DropdownMenu.Root>
      {/* --- El Botón que Activa el Menú --- */}
      <DropdownMenu.Trigger asChild>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="
            flex items-center justify-between gap-2 w-full sm:w-48 px-4 py-2 
            text-sm text-foreground bg-card border border-border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary/50
            hover:bg-muted transition-colors
          "
        >
          <span>{selectedLabel}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </DropdownMenu.Trigger>

      {/* --- El Contenido del Menú Desplegable --- */}
      <AnimatePresence>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            asChild
            sideOffset={5}
            className="
              z-50 w-[var(--radix-dropdown-menu-trigger-width)] 
              bg-card border border-border rounded-lg shadow-lg
              focus:outline-none
            "
          >
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
                {options.map((option) => (
                  <DropdownMenu.RadioItem
                    key={option.value}
                    value={option.value}
                    className="
                      flex items-center justify-between px-3 py-2 text-sm text-foreground 
                      rounded-md cursor-pointer select-none
                      hover:bg-muted focus:bg-muted focus:outline-none
                      data-[state=checked]:font-semibold data-[state=checked]:text-primary
                    "
                  >
                    <span>{option.label}</span>
                    <DropdownMenu.ItemIndicator>
                      <Check className="w-4 h-4" />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </motion.div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </AnimatePresence>
    </DropdownMenu.Root>
  );
};

export default StatusFilterDropdown;
