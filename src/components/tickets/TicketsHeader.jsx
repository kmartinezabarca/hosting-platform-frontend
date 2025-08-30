import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const TicketsHeader = ({ onCreate }) => (
  <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Mis Tickets</h1>
      <p className="text-muted-foreground">Gestiona tus solicitudes de soporte</p>
    </div>
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={onCreate}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
                 bg-[#222222] text-white dark:bg-white dark:text-[#101214]
                 shadow-sm hover:shadow-md hover:brightness-110 active:translate-y-px
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-[#222222]/40 dark:focus-visible:ring-white/40 transition"
    >
      <Plus className="h-4 w-4" /> Crear Ticket
    </motion.button>
  </div>
);

export default TicketsHeader;
