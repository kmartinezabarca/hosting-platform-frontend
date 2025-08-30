import React from "react";
import { motion } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Search, ChevronDown, Check } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");
const asArray = (v) => (Array.isArray(v) ? v : []);

const Summary = ({ type, value, options, fallback }) => {
  if (type === "multiple") {
    const arr = asArray(value);
    const labels = arr
      .map((v) => options.find((o) => o.value === v)?.label)
      .filter(Boolean);

    if (!labels.length) return <span className="text-sm font-medium">{fallback}</span>;
    if (labels.length === 1) return <span className="text-sm font-medium">{labels[0]}</span>;
    return <span className="text-sm font-medium">{labels[0]} +{labels.length - 1}</span>;
  }

  const label = options.find((o) => o.value === value)?.label || fallback;
  return <span className="text-sm font-medium">{label}</span>;
};

const FilterDropdown = ({
  label,
  type = "single", // 'single' | 'multiple'
  value,
  options = [],
  onChange,
  className,
}) => {
  const multi = type === "multiple";
  const arr = asArray(value);
  const isSelected = (v) => (multi ? arr.includes(v) : value === v);

  const toggleMulti = (v) => {
    const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    onChange(next);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className={cx(
            "group flex w-full items-center justify-between rounded-xl border border-black/10 px-4 py-3",
            "bg-white text-foreground hover:bg-black/[0.03]",
            "dark:bg-[#0f1115] dark:border-white/10 dark:hover:bg-white/[0.04]",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
            className
          )}
        >
          <Summary type={type} value={value} options={options} fallback={label} />
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground transition-transform" />
        </motion.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className={cx(
            "z-50 min-w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-auto rounded-xl border p-1 shadow-xl backdrop-blur-sm",
            "bg-white/95 text-foreground border-black/10",
            "dark:bg-[#0f1115]/95 dark:border-white/10"
          )}
        >
          {multi ? (
            options.map((opt) => (
              <DropdownMenu.CheckboxItem
                key={opt.value}
                checked={isSelected(opt.value)}
                onCheckedChange={() => toggleMulti(opt.value)}
                className={cx(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none",
                  "data-[highlighted]:bg-black/5 dark:data-[highlighted]:bg-white/5"
                )}
              >
                <span className="truncate">{opt.label}</span>
                <DropdownMenu.ItemIndicator>
                  <Check className="h-4 w-4 text-primary" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>
            ))
          ) : (
            <DropdownMenu.RadioGroup
              value={typeof value === "string" ? value : "all"}
              onValueChange={onChange}
            >
              {options.map((opt) => (
                <DropdownMenu.RadioItem
                  key={opt.value}
                  value={opt.value}
                  className={cx(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none",
                    "data-[highlighted]:bg-black/5 dark:data-[highlighted]:bg-white/5",
                    "data-[state=checked]:text-primary"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  <DropdownMenu.ItemIndicator>
                    <Check className="h-4 w-4 text-primary" />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const FiltersBar = ({
  search,
  filters = [],
  onChange,
  rightElement = null,
  className = "",
}) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    className={cx("my-6 flex flex-wrap items-center gap-4 md:flex-nowrap", className)}
  >
    {/* Izquierda: buscador (más pequeño en desktop) */}
    {search && (
      <div className="relative w-full md:w-[260px] lg:w-[300px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search.value ?? ""}
          onChange={(e) => search.onChange?.(e.target.value)}
          placeholder={search.placeholder || "Buscar..."}
          aria-label="Buscar"
          className={cx(
            "w-full rounded-xl border border-black/10 bg-white px-10 py-2.5 text-foreground",
            "placeholder:text-black/55 caret-[color:rgb(var(--primary))]",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
            "dark:bg-[#0f1115] dark:border-white/10 dark:placeholder:text-white/70"
          )}
        />
      </div>
    )}

    {/* Derecha: filtros y acción, pegados al borde derecho en desktop */}
    <div className="ml-auto flex w-full items-center justify-start gap-4 md:w-auto md:justify-end flex-wrap">
      {filters.map((f) => (
        <div key={f.key} className="min-w-[170px] md:min-w-[180px]">
          <FilterDropdown
            label={f.label}
            type={f.type || "single"}
            value={f.value}
            options={f.options || []}
            onChange={(v) => (f.onChange ? f.onChange(v) : onChange?.(f.key, v))}
          />
        </div>
      ))}

      {rightElement && <div className="shrink-0">{rightElement}</div>}
    </div>
  </motion.div>
);

export default FiltersBar;
