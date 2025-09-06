import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Plus } from "lucide-react";
import TicketRow from "./TicketRow";

const TicketSkeleton = () => (
  <div className="px-3 sm:px-4 py-4 sm:py-6 border-b border-border/60">
    <div className="flex items-start gap-4">
      <div className="h-5 w-5 rounded-md bg-black/10 dark:bg-white/10" />
      <div className="w-full space-y-2">
        <div className="h-4 w-3/4 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-3 w-2/3 rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-3 flex items-center gap-3">
          <div className="h-4 w-24 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-4 w-28 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-4 w-32 rounded bg-black/10 dark:bg-white/10" />
        </div>
      </div>
      <div className="ml-auto hidden md:block h-4 w-24 rounded bg-black/10 dark:bg-white/10" />
    </div>
  </div>
);

const TicketsList = ({ tickets = [], isLoading, onOpenChat, onCreate }) => {
  return (
    <section
      className="
        group rounded-2xl border border-border/60 bg-card/80
        shadow-sm hover:shadow-lg transition-shadow
        ring-1 ring-black/5 dark:ring-white/5 overflow-hidden
      "
      aria-busy={isLoading ? "true" : "false"}
    >
      {isLoading ? (
        <div>
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
        </div>
      ) : !tickets?.length ? (
        <div className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4 ring-1 ring-black/5 dark:ring-white/5">
            <Inbox className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No se encontraron tickets
          </h3>
          <p className="text-muted-foreground mb-6">
            Ajusta los filtros o crea un nuevo ticket para empezar.
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="
              inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
              bg-primary text-primary-foreground
              shadow-sm hover:shadow-md hover:brightness-110
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
              active:translate-y-[1px] transition
            "
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo Ticket
          </button>
        </div>
      ) : (
        <AnimatePresence initial={false} mode="popLayout">
          {tickets.map((t) => (
            <TicketRow key={t.id ?? t.uuid} ticket={t} onOpenChat={onOpenChat} />
          ))}
        </AnimatePresence>
      )}
    </section>
  );
};

export default TicketsList;
