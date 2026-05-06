// DashboardCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardCard({
  title,
  buttonText,
  buttonLink,
  delay = 0,
  xOffset = 0,
  children,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className="
        group relative overflow-hidden rounded-2xl p-6 h-full flex flex-col
        bg-white dark:bg-[#101214]
        border border-black/5 dark:border-white/10
        shadow-sm hover:shadow-lg transition-shadow
      "
    >
      {/* decor sutil */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-gradient-to-b from-black/[0.02] to-transparent
          dark:from-white/[0.04] dark:to-transparent
        "
      />
      {/* header */}
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {buttonLink && buttonText && (
          <Link
            to={buttonLink}
            className="
              text-sm font-medium text-muted-foreground hover:text-foreground
              inline-flex items-center gap-1 rounded-lg px-2 py-1
              hover:bg-black/5 dark:hover:bg-white/5 transition-colors
            "
          >
            <span>{buttonText}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </header>

      {/* contenido */}
      <div className="flex-1">{children}</div>

      {/* borde ‘reactivo’ en hover */}
      <div
        aria-hidden
        className="
          absolute inset-0 rounded-2xl pointer-events-none
          ring-1 ring-transparent group-hover:ring-black/10
          dark:group-hover:ring-white/15 transition
        "
      />
    </motion.section>
  );
}
