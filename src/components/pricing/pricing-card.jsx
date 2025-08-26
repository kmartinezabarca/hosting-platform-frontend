// components/pricing-card.jsx
import React from "react";
import { Star, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingCard({
  plan,
  billingCycle,
  discount = 0,
  selected = false,
  onSelect,
}) {
  const base = plan.price[billingCycle];
  const finalPrice = (base * (1 - discount / 100)).toFixed(2);
  const featured = !!plan.popular;

  return (
    <motion.div
      className="relative h-full"                // <- iguala altura del contenedor
      whileHover={{ y: -6, scale: 1.01 }}       // <- animación hover
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      {featured && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold bg-[#3b82f6] text-white shadow">
            <Star className="w-3.5 h-3.5" /> Más popular
          </span>
        </div>
      )}

      <div
        className={[
          "rounded-[20px] p-7 border transition h-full flex flex-col group", // <- h-full + flex-col
          featured
            ? "bg-[#0f172a] text-white border-white/10 ring-1 ring-white/10 hover:ring-white/20"
            : "bg-white dark:bg-[#101214] text-foreground border-black/5 dark:border-white/10 hover:ring-2 hover:ring-black/10 dark:hover:ring-white/20",
          selected ? "ring-2 ring-emerald-500/50" : "",
          "min-h-[560px] md:min-h-[600px]", // <- altura mínima consistente
          "hover:shadow-xl",                // <- sombra al pasar el cursor
        ].join(" ")}
      >
        {/* ===== Contenido (ocupa el alto disponible) ===== */}
        <div className="flex-1">
          {/* header */}
          <div className="space-y-1 mb-6">
            <h3 className={`text-xl font-bold ${featured ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
            <p className={`text-sm ${featured ? "text-white/70" : "text-muted-foreground"}`}>{plan.description}</p>
          </div>

          {/* price */}
          <div className="space-y-1 mb-6">
            <div className="flex items-baseline gap-1">
              <span className={`text-lg ${featured ? "text-white" : "text-foreground"}`}>$</span>
              <span className={`text-5xl font-extrabold leading-none ${featured ? "text-white" : "text-foreground"}`}>
                {finalPrice}
              </span>
              <span className={`ml-1 text-sm ${featured ? "text-white/70" : "text-muted-foreground"}`}>/mes</span>
            </div>
            {discount > 0 && (
              <div className={`text-sm line-through ${featured ? "text-white/50" : "text-muted-foreground"}`}>
                ${base.toFixed(2)}
              </div>
            )}
          </div>

          {/* features */}
          <ul className="space-y-2.5 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full p-1.5 bg-emerald-500/15 ring-1 ring-emerald-500/25">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </span>
                <span className={featured ? "text-white" : "text-foreground"}>{f}</span>
              </li>
            ))}
          </ul>

          {/* specs */}
          <div
            className={[
              "rounded-xl p-4 ring-1",
              featured
                ? "bg-white/[0.06] ring-white/10"
                : "bg-black/5 dark:bg-white/5 ring-black/5 dark:ring-white/10",
            ].join(" ")}
          >
            <h4 className={`font-semibold mb-3 text-sm ${featured ? "text-white" : "text-foreground"}`}>Especificaciones</h4>
            <div className="grid grid-cols-2 gap-y-2">
              {Object.entries(plan.specs).map(([k, v]) => (
                <React.Fragment key={k}>
                  <div className={`py-1 text-sm capitalize ${featured ? "text-white/70" : "text-muted-foreground"}`}>
                    {k.replace(/_/g, " ")}
                  </div>
                  <div className={`py-1 text-right text-sm font-medium ${featured ? "text-white" : "text-foreground"}`}>
                    {v}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Botón (siempre abajo) ===== */}
        <button
          onClick={onSelect}
          className={[
            "mt-6 w-full rounded-xl py-3 font-semibold transition group-hover:shadow-md group-hover:brightness-[1.03]",
            selected
              ? "bg-emerald-600 text-white hover:brightness-110"
              : featured
              ? "bg-[#6366f1] text-white hover:brightness-110"
              : "bg-black/5 dark:bg-white/10 text-foreground ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/10 dark:hover:bg-white/15",
          ].join(" ")}
        >
          {selected ? "Seleccionado" : "Seleccionar Plan"}
        </button>
      </div>
    </motion.div>
  );
}
