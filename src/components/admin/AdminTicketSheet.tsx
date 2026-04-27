// /components/admin/AdminTicketSheet.jsx
// Panel lateral completo para atender tickets desde el admin.
// Incluye: historial de mensajes, adjuntos/imágenes, cambio de estado/prioridad,
// composer con archivos y suscripción Reverb en tiempo real.

import React, { useMemo, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Clock, Loader2, RefreshCw,
  ChevronDown, AlertTriangle, CheckCircle2, Circle,
  ZapIcon, ArrowUpIcon, MinusIcon, ArrowDownIcon,
  ImageOff,
} from "lucide-react";
import { toast } from "sonner";

import adminTicketsService from "@/services/adminTicketsService";
import { getEcho } from "@/services/echoService";
import { useAuth } from "@/context/AuthContext";
import { MessageList } from "@/components/chat/MessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { Lightbox } from "@/components/chat/Lightbox";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useChatInteractions } from "@/hooks/useChatInteractions";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILES_PER_MESSAGE,
  isImageMime,
  fmtDate,
} from "@/lib/chatUtils";
import { cn } from "@/lib/utils";

/* ── Query keys ─────────────────────────────────────────────── */
const qk = {
  detail: (id) => ["admin", "ticket-detail", String(id ?? "none")],
};

/* ── Status config ──────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: "open",             label: "Abierto",           dot: "bg-blue-500",    text: "text-blue-600 dark:text-blue-400" },
  { value: "in_progress",      label: "En progreso",       dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400" },
  { value: "waiting_customer", label: "Esp. cliente",      dot: "bg-purple-500",  text: "text-purple-600 dark:text-purple-400" },
  { value: "resolved",         label: "Resuelto",          dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { value: "closed",           label: "Cerrado",           dot: "bg-slate-400",   text: "text-slate-500 dark:text-slate-400" },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Baja",    icon: ArrowDownIcon, color: "text-slate-500" },
  { value: "medium", label: "Media",   icon: MinusIcon,     color: "text-blue-500" },
  { value: "high",   label: "Alta",    icon: ArrowUpIcon,   color: "text-amber-500" },
  { value: "urgent", label: "Urgente", icon: ZapIcon,       color: "text-red-500" },
];

/* ── Helpers ─────────────────────────────────────────────────── */
const selectCls = cn(
  "appearance-none border border-border rounded-lg px-2.5 py-1 pr-6 text-xs font-medium",
  "bg-background text-foreground cursor-pointer outline-none",
  "focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

function normalizeMessages(ticket: any) {
  if (!ticket) return [];
  const msgs: any[] = [];

  // El primer mensaje es la descripción del ticket
  if (ticket.description) {
    msgs.push({
      id: `ticket-first-${ticket.id}`,
      message: ticket.description,
      user: ticket.user ?? null,
      created_at: ticket.created_at,
      attachments: ticket.attachments ?? [],
      _isFirst: true,
    });
  }

  // Replies (el backend puede devolver replies o messages)
  const replies = ticket.replies ?? ticket.messages ?? [];
  replies.forEach((r) => {
    msgs.push({
      id: `reply-${r.id}`,
      message: r.message ?? r.content ?? "",
      user: r.user ?? null,
      created_at: r.created_at,
      attachments: r.attachments ?? [],
      is_internal: r.is_internal ?? false,
    });
  });

  return msgs;
}

/* ── Componente principal ────────────────────────────────────── */
export function AdminTicketSheet({ ticket: initialTicket, onClose }) {
  const { user: adminUser } = useAuth();
  const qc = useQueryClient();
  const ticketId = initialTicket?.id;

  /* 1. Query — carga detalle + replies ─────────────────────── */
  const {
    data: ticketDetail,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.detail(ticketId),
    queryFn: async () => {
      const res = await adminTicketsService.getById(ticketId);
      // El backend puede devolver { success, data: { ... } } o la data directamente
      return res?.data ?? res;
    },
    enabled: Boolean(ticketId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const ticket = ticketDetail ?? initialTicket;

  /* 2. Mensajes normalizados ──────────────────────────────── */
  const messages = useMemo(() => normalizeMessages(ticket), [ticket]);

  /* 3. Mutation — cambiar estado ─────────────────────────── */
  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) => adminTicketsService.changeStatus(id, status as any),
    onSuccess: (_, { status }) => {
      qc.setQueryData(qk.detail(ticketId), (old) =>
        old ? { ...old, status } : old
      );
      qc.invalidateQueries({ queryKey: ["admin", "ticket-detail"] });
      toast.success(`Estado actualizado a "${STATUS_OPTIONS.find(s => s.value === status)?.label ?? status}"`);
    },
    onError: () => toast.error("No se pudo cambiar el estado"),
  });

  /* 4. Mutation — cambiar prioridad ──────────────────────── */
  const priorityMut = useMutation({
    mutationFn: ({ id, priority }: { id: string | number; priority: string }) => adminTicketsService.changePriority(id, priority as any),
    onSuccess: (_, { priority }) => {
      qc.setQueryData(qk.detail(ticketId), (old) =>
        old ? { ...old, priority } : old
      );
      toast.success(`Prioridad actualizada`);
    },
    onError: () => toast.error("No se pudo cambiar la prioridad"),
  });

  /* 5. Mutation — enviar respuesta ───────────────────────── */
  const replyMut = useMutation({
    mutationFn: async ({ id, message, files = [] }: { id: string | number; message: string; files?: File[] }) => {
      let body;
      if (files.length > 0) {
        body = new FormData();
        body.append("message", message ?? "");
        files.forEach((f) => body.append("attachments[]", f));
      } else {
        body = { message: message ?? "", is_internal: false };
      }
      const res = await adminTicketsService.addReply(id, body);
      return res?.data ?? res;
    },
    onSuccess: () => {
      // Refetch completo para obtener la reply con todos sus datos normalizados
      qc.invalidateQueries({ queryKey: qk.detail(ticketId) });
    },
    onError: () => toast.error("Error al enviar la respuesta"),
  });

  /* 6. File handling ─────────────────────────────────────── */
  const {
    files,
    fileErrors,
    isDragging,
    handleIncomingFiles,
    removeFile,
    clearFiles,
    dropRef,
    fileInputRef,
  } = useFileHandling({
    allowedTypes: ALLOWED_MIME_TYPES,
    maxSizeMB: MAX_FILE_SIZE_MB,
    fileLimit: MAX_FILES_PER_MESSAGE,
    disabled: replyMut.isPending || ticket?.status === "closed",
  });

  /* 7. Lightbox ──────────────────────────────────────────── */
  const { lightbox, openLightbox, closeLightbox, navigateLightbox } =
    useChatInteractions(true, false, onClose);

  const allImages = useMemo(
    () =>
      messages
        .flatMap((m) => (m.attachments || []).filter((a) => isImageMime(a.mime)))
        .map((a) => a.url || a.path),
    [messages]
  );

  const handleImageClick = (imgUrl) => {
    const index = allImages.findIndex((u) => u === imgUrl);
    if (index !== -1) openLightbox(allImages, index);
  };

  /* 8. Submit handler ────────────────────────────────────── */
  const handleSubmit = async ({ text }) => {
    if (!text && files.length === 0) return;
    await replyMut.mutateAsync({
      id: ticketId,
      message: text,
      files: files.map((f) => f.file),
    });
    clearFiles();
  };

  /* 9. Reverb — tiempo real para este ticket ─────────────── */
  useEffect(() => {
    if (!ticket?.uuid) return;

    let echo;
    try { echo = getEcho(); } catch { return; }

    const channelName = `ticket.${ticket.uuid}`;
    let ch;
    try {
      ch = echo.private(channelName);
      ch.subscribed(() => console.log("✅ AdminTicketSheet subscribed:", channelName));
      ch.error((e) => console.warn("⚠️ AdminTicketSheet channel error:", e));
    } catch (err) {
      console.warn("AdminTicketSheet Echo subscribe error:", err);
      return;
    }

    // Cuando llega una reply nueva → refetch del detalle para ver la reply con datos completos
    const onReplied = (e) => {
      console.log("📩 admin ticket.replied", e);
      qc.invalidateQueries({ queryKey: qk.detail(ticketId) });
    };

    const onClosed = () => {
      qc.invalidateQueries({ queryKey: qk.detail(ticketId) });
    };

    ch.listen(".ticket.replied", onReplied);
    ch.listen(".ticket.closed", onClosed);

    return () => {
      try {
        ch.stopListening(".ticket.replied");
        ch.stopListening(".ticket.closed");
      } catch {}
    };
  }, [ticket?.uuid, ticketId, qc]);

  /* ── Render ──────────────────────────────────────────────── */
  const statusCfg = STATUS_OPTIONS.find((s) => s.value === ticket?.status);
  const priorityCfg = PRIORITY_OPTIONS.find((p) => p.value === ticket?.priority);
  const PriorityIcon = priorityCfg?.icon ?? MinusIcon;
  const isClosed = ticket?.status === "closed";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="fixed right-0 top-0 bottom-0 z-[210] flex flex-col w-full sm:w-[min(600px,95vw)] bg-card dark:bg-[#0f1115] border-l border-border shadow-2xl"
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="shrink-0 border-b border-border">
          {/* Fila superior: título + cerrar */}
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">
                  #{ticket?.ticket_number ?? ticket?.id}
                </span>
                <h2 className="text-base font-semibold text-foreground truncate">
                  {ticket?.subject ?? "Cargando…"}
                </h2>
              </div>
              {ticket?.user && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    {[ticket.user.first_name, ticket.user.last_name].filter(Boolean).join(" ")}
                  </span>
                  {ticket.user.email && (
                    <span className="opacity-60">— {ticket.user.email}</span>
                  )}
                </div>
              )}
              {ticket?.created_at && (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{fmtDate(ticket.created_at)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Fila inferior: controles de estado y prioridad */}
          <div className="flex items-center gap-3 px-5 pb-3 flex-wrap">
            {/* Estado */}
            <div className="relative flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block w-2 h-2 rounded-full shrink-0",
                  statusCfg?.dot ?? "bg-muted"
                )}
              />
              <select
                value={ticket?.status ?? "open"}
                onChange={(e) =>
                  statusMut.mutate({ id: ticketId, status: e.target.value })
                }
                disabled={statusMut.isPending}
                className={cn(selectCls, statusCfg?.text)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              {statusMut.isPending && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </div>

            <span className="text-border">|</span>

            {/* Prioridad */}
            <div className="relative flex items-center gap-1.5">
              <PriorityIcon
                className={cn("w-3.5 h-3.5 shrink-0", priorityCfg?.color ?? "text-muted-foreground")}
              />
              <select
                value={ticket?.priority ?? "medium"}
                onChange={(e) =>
                  priorityMut.mutate({ id: ticketId, priority: e.target.value })
                }
                disabled={priorityMut.isPending}
                className={cn(selectCls, priorityCfg?.color)}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              {priorityMut.isPending && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </div>

            <span className="ml-auto text-xs text-muted-foreground">
              {messages.length} mensajes
            </span>
          </div>
        </div>

        {/* ── Cuerpo: mensajes ─────────────────────────────── */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin opacity-50" />
              <p className="text-sm">Cargando conversación…</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive/70" />
              <p className="text-sm font-medium text-foreground">No se pudo cargar el ticket</p>
              <button
                onClick={() => refetch()}
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                Reintentar
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="w-8 h-8 opacity-30" />
              <p className="text-sm">Sin mensajes aún</p>
            </div>
          ) : (
            <MessageList
              messages={messages}
              onImageClick={handleImageClick}
              currentUserId={adminUser?.id}
            />
          )}
        </div>

        {/* ── Composer ─────────────────────────────────────── */}
        {!isLoading && !error && (
          <ChatComposer
            onSubmit={handleSubmit}
            sending={replyMut.isPending}
            canReply={!isClosed}
            dropRef={dropRef}
            fileInputRef={fileInputRef}
            isDragging={isDragging}
            files={files}
            fileErrors={fileErrors}
            removeFile={removeFile}
            handleIncomingFiles={handleIncomingFiles}
          />
        )}
      </motion.div>

      {/* Lightbox — z-[220] para quedar sobre el panel (z-[210]) */}
      <Lightbox
        isOpen={lightbox.open}
        items={lightbox.items}
        startIndex={lightbox.index}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
        zIndex={220}
      />
    </AnimatePresence>
  );
}
