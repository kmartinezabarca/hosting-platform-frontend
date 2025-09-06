// src/pages/client/ClientTicketsPage.jsx
import React, { useMemo, useState } from "react";
import FiltersBar from "@/components/ui/FiltersBar";
import TicketsHeader from "@/components/tickets/TicketsHeader";
import TicketsList from "@/components/tickets/TicketsList";
import TicketCreateModal from "@/components/tickets/TicketCreateModal";
import { useTicketChat } from "@/context/TicketChatContext";
import {
  useTickets,
  useCreateTicket,
} from "@/hooks/useTickets";
import { useQueryClient } from "@tanstack/react-query";
import { ticketsKeys } from "../../hooks/useTickets";

// Map de categoría (UI) -> department (API)
const categoryToDepartment = {
  technical: "technical",
  billing: "billing",
  general: "sales",
  feature_request: "sales",
  bug_report: "technical",
};

const ClientTicketsPage = () => {
  const qc = useQueryClient();

  // filtros / búsqueda (estado local de UI)
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  // Crear ticket (modal + form)
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium",
    category: "general",
  });

  const apiParams = {
    status: status !== "all" ? status : undefined,
    priority: priority !== "all" ? priority : undefined,
    department: category !== "all" ? categoryToDepartment[category] : undefined,
    per_page: 50,
  };

  // Listado desde hook
  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTickets(apiParams);

  // Búsqueda local
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return tickets.filter((t) => {
      const subj = (t.subject || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      return !ql || subj.includes(ql) || desc.includes(ql);
    });
  }, [tickets, q]);

  // Abrir chat: trae el detalle usando el QueryClient (sin crear hook “ad hoc”)
  const { openChat } = useTicketChat();
  const onOpenChat = async (ticket) => {
    try {
      const uuid = ticket.uuid;
      if (!uuid) {
        console.warn("El ticket no trae UUID en el listado. Ajusta backend o mapea.");
        openChat(ticket, ticket?.replies || []);
        return;
      }
      const detail = await qc.fetchQuery({
        queryKey: ticketsKeys.detail(uuid),
        queryFn: () => import('../../services/ticketService').then(m => m.default.getTicket(uuid)),
        staleTime: 0,
      });
      const full = detail?.data ?? detail;
      openChat(full, full?.replies || []);
    } catch (e) {
      console.error("Error opening ticket:", e);
      openChat(ticket, ticket?.replies || []);
    }
  };

  // Crear ticket (hook)
  const { mutateAsync: createTicket, isPending: creating } = useCreateTicket({
    onSuccess: (res) => {
      const created = res?.data ?? res;
      // Prepend optimista (opcional): invalidamos lista y listo
      // qc.invalidateQueries({ queryKey: ticketsKeys.all });
      // O si quieres ver reflejado al instante sin esperar refetch:
      qc.setQueryData(ticketsKeys.list(apiParams), (old) => {
        const rows = Array.isArray(old) ? old : [];
        return created ? [created, ...rows] : rows;
      });
      setShowCreate(false);
      setForm({ subject: "", description: "", priority: "medium", category: "general" });
    },
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const department = categoryToDepartment[form.category] ?? "technical";
    const payload = {
      subject: form.subject,
      message: form.description, // backend espera "message" para la 1ª respuesta
      priority: form.priority,
      department,
      // service_id: opcional
    };
    await createTicket(payload);
  };

  // Skeleton simple (puedes reutilizar tu <Skeleton/> si prefieres)
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
        <div className="loading-skeleton h-8 w-48 mb-4" />
        <div className="loading-skeleton h-10 w-full mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card-premium p-6 mb-4">
            <div className="loading-skeleton h-6 w-2/3 mb-3" />
            <div className="loading-skeleton h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <TicketsHeader onCreate={() => setShowCreate(true)} />

      <FiltersBar
        search={{ value: q, onChange: setQ, placeholder: "Buscar tickets..." }}
        filters={[
          {
            key: "status",
            label: "Estado",
            value: status,
            options: [
              { value: "all", label: "Todos los estados" },
              { value: "open", label: "Abierto" },
              { value: "in_progress", label: "En progreso" },
              { value: "waiting_customer", label: "Esperando respuesta" },
              { value: "resolved", label: "Resuelto" },
              { value: "closed", label: "Cerrado" },
            ],
          },
          {
            key: "priority",
            label: "Prioridad",
            value: priority,
            options: [
              { value: "all", label: "Todas las prioridades" },
              { value: "urgent", label: "Urgente" },
              { value: "high", label: "Alta" },
              { value: "medium", label: "Media" },
              { value: "low", label: "Baja" },
            ],
          },
          {
            key: "category",
            label: "Categoría",
            value: category,
            options: [
              { value: "all", label: "Todas las categorías" },
              { value: "technical", label: "Técnico" },
              { value: "billing", label: "Facturación" },
              { value: "general", label: "General" },
              { value: "feature_request", label: "Función" },
              { value: "bug_report", label: "Bug" },
            ],
          },
        ]}
        onChange={(key, val) => {
          if (key === "status") setStatus(val);
          if (key === "priority") setPriority(val);
          if (key === "category") setCategory(val);
        }}
      />

      <TicketsList
        tickets={filtered}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onOpenChat={onOpenChat}
        onCreate={() => setShowCreate(true)}
        refetch={refetch}
      />

      <TicketCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        form={form}
        setForm={setForm}
        creating={creating}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default ClientTicketsPage;