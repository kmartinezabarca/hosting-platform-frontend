import React from "react";
import { motion } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Search, ChevronDown, Check } from "lucide-react";

// --- Componente de Filtros con Diseño Premium ---
const ServiceFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
}) => {
  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activo" },
    { value: "maintenance", label: "Mantenimiento" },
    { value: "suspended", label: "Suspendido" },
    { value: "stopped", label: "Detenido" },
  ];

  const typeOptions = [
    { value: "all", label: "Todos los tipos" },
    { value: "shared_hosting", label: "Web Hosting" },
    { value: "vps", label: "VPS" },
    { value: "game_server", label: "Servidor de Juegos" },
    { value: "database", label: "Base de Datos" },
  ];

  const FilterDropdown = ({ label, options, value, onValueChange }) => {
  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="
            group w-full flex items-center justify-between text-left
            px-4 py-3 rounded-xl
            bg-white dark:bg-card
            text-foreground
            border border-black/10 dark:border-white/10
            hover:bg-black/5 dark:hover:bg-white/5
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50
            transition
          "
        >
          <span className="text-sm font-medium">{selectedLabel}</span>
          <ChevronDown
            className="
              w-4 h-4 text-muted-foreground transition-transform
              group-data-[state=open]:rotate-180
            "
          />
        </motion.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="start"
          className="
            z-50 w-[--radix-dropdown-menu-trigger-width] rounded-xl p-1
            bg-white/95 dark:bg-card/95
            border border-black/10 dark:border-white/10
            shadow-[0_8px_30px_rgba(0,0,0,0.08)]
            dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]
            text-foreground
            backdrop-blur-sm
            max-h-60 overflow-auto
            animate-in fade-in-0 zoom-in-95
          "
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
            {options.map(opt => (
              <DropdownMenu.RadioItem
                key={opt.value}
                value={opt.value}
                className="
                  flex items-center justify-between gap-3
                  text-sm px-3 py-2 rounded-lg cursor-pointer
                  outline-none
                  data-[highlighted]:bg-black/5 dark:data-[highlighted]:bg-white/5
                  data-[state=checked]:text-primary
                  transition-colors
                "
              >
                <span className="truncate">{opt.label}</span>
                <DropdownMenu.ItemIndicator>
                  <Check className="w-4 h-4 text-primary" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 my-8"
    >
      {/* --- Búsqueda Premium --- */}
      <div className="relative md:col-span-2 lg:col-span-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full pl-12 pr-4 py-3 rounded-xl
            bg-white dark:bg-card
            text-foreground
            border border-black/10 dark:border-white/10
            placeholder:opacity-100
            placeholder:text-black/55 dark:placeholder:text-white/70
            caret-[color:rgb(var(--primary))]
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50
            transition"
        />
      </div>
      <div className="hidden lg:block lg:col-span-1"></div>
      {/* --- Filtros Desplegables Premium --- */}
      <div className="md:col-span-1 lg:col-span-1">
        <FilterDropdown
          label="Filtrar por estado"
          options={statusOptions}
          value={statusFilter}
          onValueChange={setStatusFilter}
        />
      </div>
      <div className="md:col-span-1 lg:col-span-1">
        <FilterDropdown
          label="Filtrar por tipo"
          options={typeOptions}
          value={typeFilter}
          onValueChange={setTypeFilter}
        />
      </div>
    </motion.div>
  );
};

export default ServiceFilters;
