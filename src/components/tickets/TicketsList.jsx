import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Plus, Inbox } from "lucide-react";
import TicketRow from "./TicketRow";

const TicketSkeleton = () => (
  <div className="grid grid-cols-12 items-center gap-x-4 border-b border-border/60 px-4 py-3">
    <div className="col-span-6 flex items-center gap-4">
      <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
      <div className="w-full space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
      </div>
    </div>
    <div className="col-span-2 hidden md:block">
      <div className="h-4 w-20 rounded bg-muted animate-pulse" />
    </div>
    <div className="col-span-2 hidden lg:block">
      <div className="h-4 w-16 rounded bg-muted animate-pulse" />
    </div>
    <div className="col-span-2 flex justify-end">
      <div className="h-4 w-12 rounded bg-muted animate-pulse" />
    </div>
  </div>
);

const TicketsList = ({ tickets, isLoading,onOpenChat, onCreate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      {isLoading ? (
        // --- 1. Estado de Carga ---
        <div>
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
        </div>
      ) : !tickets?.length ? (
        // --- 2. Estado Vacío (mejorado) ---
        <div className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Inbox className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No se encontraron tickets
          </h3>
          <p className="text-muted-foreground mb-4">
            Ajusta los filtros o crea un nuevo ticket para empezar.
          </p>
          <button
            onClick={onCreate}
            className="btn-premium btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo Ticket
          </button>
        </div>
      ) : (
        // --- 3. Lista de Tickets ---
        <div>
          {tickets.map((t) => (
            <TicketRow key={t.id} ticket={t} onOpenChat={onOpenChat} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TicketsList;
