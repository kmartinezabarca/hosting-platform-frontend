// src/pages/client/ClientTicketsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FiltersBar from "../../components/ui/FiltersBar";
import TicketsHeader from "../../components/tickets/TicketsHeader";
import TicketsList from "../../components/tickets/TicketsList";
import TicketCreateModal from "../../components/tickets/TicketCreateModal";
import { useTicketChat } from "../../context/TicketChatContext";
import ticketsService from "../../services/tickets";

// Map de categoría (UI) -> department (API)
const categoryToDepartment = {
  technical: "technical",
  billing: "billing",
  general: "sales",        // ajusta si prefieres otro departamento por defecto
  feature_request: "sales",
  bug_report: "technical",
};

const ClientTicketsPage = () => {
  const { user } = useAuth();

  // Estado base
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros / búsqueda
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  // Crear ticket
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium",
    category: "general",
  });

  // Dock chat (global)
  const { openChat } = useTicketChat();

  // --- Cargar tickets desde API ---
  useEffect(() => {
    let abort = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          status: status !== "all" ? status : undefined,
          priority: priority !== "all" ? priority : undefined,
          department:
            category !== "all"
              ? categoryToDepartment[category] ?? undefined
              : undefined,
          per_page: 50,
          signal: abort.signal,
        };
        const res = await ticketsService.getTickets(params);
        // Laravel paginator: res.data = { data: [...], ... }
        const rows = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setTickets(rows);
      } catch (e) {
        console.error("Error loading tickets:", e);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => abort.abort();
  }, [status, priority, category]);

  // Filtro de búsqueda local (cliente)
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return tickets.filter((t) => {
      const subj = (t.subject || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      return !ql || subj.includes(ql) || desc.includes(ql);
    });
  }, [tickets, q]);

  // Abrir chat: trae el detalle + replies reales
  const onOpenChat = async (ticket) => {
    try {
      // el index debe devolver uuid; si no, ajusta backend o mapea aquí
      const uuid = ticket.uuid;
      if (!uuid) {
        console.warn("El ticket no trae UUID desde /tickets. Ajusta el backend para incluirlo.");
        openChat(ticket, ticket?.replies || []);
        return;
      }
      const res = await ticketsService.getTicket(uuid);
      const full = res?.data || {};
      openChat(full, full?.replies || []);
    } catch (e) {
      console.error("Error opening ticket:", e);
      // abre con lo que tengamos
      openChat(ticket, ticket?.replies || []);
    }
  };

  // Crear ticket: conecta con POST /tickets
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const department =
        categoryToDepartment[form.category] ?? "technical"; // fallback seguro
      const payload = {
        subject: form.subject,
        message: form.description, // API espera "message" para la 1a respuesta
        priority: form.priority,
        department,
        // service_id: opcional si la UI lo pide
      };
      const res = await ticketsService.createTicket(payload);
      const created = res?.data;
      if (created) {
        // Prepend para que aparezca arriba
        setTickets((prev) => [created, ...prev]);
        setShowCreate(false);
        setForm({
          subject: "",
          description: "",
          priority: "medium",
          category: "general",
        });
      }
    } catch (e) {
      console.error("Error creating ticket:", e);
    } finally {
      setCreating(false);
    }
  };

  // Skeleton
  if (loading) {
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
    <div className="mx-auto w/full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
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
          // Mantenemos el control de "Categoría" pero lo mapeamos a department en la llamada
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
        isLoading={loading}
        onOpenChat={onOpenChat}
        onCreate={() => setShowCreate(true)}
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
