import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Send, Terminal, AlertTriangle, 
  RotateCcw, Trash2, Download, Search, Clock,
  ChevronDown, Sun, Moon
} from "lucide-react";
import { useGameServerWebSocket } from "@/hooks/useGameServerHooks";

interface ConsoleLog { id: number; text: string; ts: Date; }
interface GameServerConsoleProps {
  serviceUuid: string;
  serverName?: string;
  className?: string;
  enabled?: boolean;
}

// Colores de línea según tema
const getLineColor = (text: string, dark: boolean) => {
  const t = text.toLowerCase();
  if (t.includes("error") || t.includes("fatal") || t.includes("exception"))
    return dark ? "text-rose-400"    : "text-rose-600";
  if (t.includes("warn"))
    return dark ? "text-amber-400"   : "text-amber-600";
  if (t.includes("info") || t.includes("[server]") || t.includes("done"))
    return dark ? "text-emerald-400" : "text-emerald-700";
  if (t.startsWith(">"))
    return dark ? "text-sky-400"     : "text-sky-600";
  return dark ? "text-neutral-300"   : "text-neutral-700";
};

export function GameServerConsole({
  serviceUuid, serverName, className, enabled = true,
}: GameServerConsoleProps) {
  const [logs, setLogs]               = useState<ConsoleLog[]>([]);
  const [command, setCommand]         = useState("");
  const [search, setSearch]           = useState("");
  const [connected, setConnected]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [sending, setSending]         = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [isAutoScroll, setIsAutoScroll]     = useState(true);

  // ── Dark/light mode ──────────────────────────────────────
  const [isDark, setIsDark] = useState(false);

  // Paleta dinámica
  const theme = isDark ? {
    wrap:       "bg-[#0d1117] border-white/[0.08]",
    header:     "bg-[#161b22] border-white/[0.08]",
    toolbar:    "bg-[#0d1117] border-white/[0.05]",
    logs:       "bg-[#0d1117]",
    input:      "bg-[#161b22] border-white/[0.08]",
    inputText:  "text-white placeholder-neutral-500",
    prompt:     "text-emerald-500",
    btnText:    "text-neutral-500 hover:text-neutral-300",
    btnDanger:  "hover:text-rose-400",
    btnInfo:    "hover:text-sky-400",
    searchBg:   "bg-white/[0.05] border-white/10 text-white placeholder-neutral-400 focus:border-emerald-500/50",
    statusBg:   "bg-white/[0.03] border-white/5",
    statusDot:  (c: boolean) => c ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500",
    footerText: "text-neutral-300",
    scrollbars: `
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
    `,
  } : {
    wrap:       "bg-[#f8f9fa] border-neutral-200",
    header:     "bg-white border-neutral-200",
    toolbar:    "bg-[#f8f9fa] border-neutral-100",
    logs:       "bg-[#f8f9fa]",
    input:      "bg-white border-neutral-200",
    inputText:  "text-neutral-900 placeholder-neutral-400",
    prompt:     "text-emerald-600",
    btnText:    "text-neutral-400 hover:text-neutral-700",
    btnDanger:  "hover:text-rose-500",
    btnInfo:    "hover:text-sky-600",
    searchBg:   "bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-emerald-400",
    statusBg:   "bg-neutral-100 border-neutral-200",
    statusDot:  (c: boolean) => c ? "bg-emerald-500" : "bg-rose-500",
    footerText: "text-neutral-400",
    scrollbars: `
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.22); }
    `,
  };

  const wsRef        = useRef<WebSocket | null>(null);
  const logIdRef     = useRef(0);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const historyRef   = useRef<string[]>([]);
  const histPosRef   = useRef(-1);
  const currentInputRef = useRef("");

  const fetchCredentials = useGameServerWebSocket(serviceUuid);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  };

  useEffect(() => { if (isAutoScroll) scrollToBottom(); }, [logs, isAutoScroll]);

  const addLog = useCallback((text: string) => {
    setLogs(prev => {
      const next = [...prev, { id: ++logIdRef.current, text, ts: new Date() }];
      return next.length > 500 ? next.slice(-500) : next;
    });
  }, []);

  const connect = useCallback(async () => {
    if (!enabled) return;
    setLoading(true); setError(null);
    const creds = await fetchCredentials();
    if (!creds) { setError("Error de credenciales."); setLoading(false); return; }
    wsRef.current?.close();
    const ws = new WebSocket(creds.socket);
    wsRef.current = ws;
    ws.onopen    = () => ws.send(JSON.stringify({ event: "auth", args: [creds.token] }));
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === "auth success") {
          setConnected(true); setLoading(false);
          ws.send(JSON.stringify({ event: "send logs", args: [null] }));
        } else if (msg.event === "console output") {
          addLog(msg.args?.[0] ?? "");
        }
      } catch { }
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => { setError("Error de conexión."); setConnected(false); setLoading(false); };
  }, [fetchCredentials, addLog, enabled]);

  useEffect(() => { connect(); return () => wsRef.current?.close(); }, [serviceUuid, enabled, connect]);

  const sendCommand = useCallback(() => {
    const cmd = command.trim();
    if (!cmd || !connected) return;
    setSending(true);
    wsRef.current?.send(JSON.stringify({ event: "send command", args: [cmd] }));
    if (historyRef.current[0] !== cmd)
      historyRef.current = [cmd, ...historyRef.current.slice(0, 49)];
    histPosRef.current = -1;
    setCommand("");
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [command, connected]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { sendCommand(); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!historyRef.current.length) return;
      if (histPosRef.current === -1) currentInputRef.current = command;
      const next = Math.min(histPosRef.current + 1, historyRef.current.length - 1);
      histPosRef.current = next;
      setCommand(historyRef.current[next]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histPosRef.current === -1) return;
      const next = histPosRef.current - 1;
      histPosRef.current = next;
      setCommand(next === -1 ? currentInputRef.current : historyRef.current[next]);
    }
  };

  const filteredLogs = useMemo(() =>
    logs.filter(l => l.text.toLowerCase().includes(search.toLowerCase())),
    [logs, search]
  );

  return (
    <div className={clsx(
      "relative flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors duration-200",
      theme.wrap,
      className ?? "h-[600px]"
    )}>

      {/* ── Header ── */}
      <div className={clsx("flex items-center justify-between px-4 py-3 border-b transition-colors duration-200", theme.header)}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-amber-500/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <Terminal className={clsx("w-3.5 h-3.5", isDark ? "text-neutral-500" : "text-neutral-400")} />
          <span className={clsx("text-xs font-bold uppercase tracking-tight", isDark ? "text-neutral-200" : "text-neutral-700")}>
            {serverName || "Terminal"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar log..."
              className={clsx(
                "border rounded-md pl-8 pr-2 py-1 text-[11px] outline-none transition-all w-32 focus:w-48",
                theme.searchBg
              )}
            />
          </div>

          {/* Timestamps */}
          <button
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={clsx(
              "p-1.5 rounded transition-colors",
              showTimestamps
                ? "text-emerald-400"
                : isDark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-700"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* ── Dark/Light toggle ── */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className={clsx(
              "p-1.5 rounded-md transition-colors",
              isDark
                ? "text-neutral-400 hover:text-amber-400 hover:bg-white/5"
                : "text-neutral-400 hover:text-violet-600 hover:bg-neutral-100"
            )}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Status pill */}
          <div className={clsx("flex items-center gap-2 px-2.5 py-1 rounded-md border", theme.statusBg)}>
            <div className={clsx("w-1.5 h-1.5 rounded-full", theme.statusDot(connected))} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-tight", isDark ? "text-neutral-400" : "text-neutral-500")}>
              {connected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={clsx("flex items-center justify-between px-4 py-1.5 border-b transition-colors duration-200", theme.toolbar)}>
        <div className="flex gap-4">
          <button
            onClick={() => setLogs([])}
            className={clsx("text-[10px] font-bold flex items-center gap-1 transition-colors uppercase", theme.btnText, theme.btnDanger)}
          >
            <Trash2 className="w-3 h-3" /> Limpiar
          </button>
          <button
            className={clsx("text-[10px] font-bold flex items-center gap-1 transition-colors uppercase", theme.btnText, theme.btnInfo)}
          >
            <Download className="w-3 h-3" /> Exportar
          </button>
        </div>
        {error && (
          <span className="text-[10px] text-rose-400 font-medium animate-pulse">{error}</span>
        )}
      </div>

      {/* ── Log area ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={clsx(
          "flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed selection:bg-emerald-500/30 transition-colors duration-200",
          theme.logs
        )}
      >
        <AnimatePresence initial={false}>
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-3 min-w-0">
              {showTimestamps && (
                <span className={clsx("shrink-0 select-none", isDark ? "text-neutral-600" : "text-neutral-400")}>
                  {log.ts.toLocaleTimeString([], { hour12: false })}
                </span>
              )}
              <span className={clsx("whitespace-pre-wrap break-all", getLineColor(log.text, isDark))}>
                {log.text}
              </span>
            </div>
          ))}
        </AnimatePresence>

        {!isAutoScroll && logs.length > 0 && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-8 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 z-30 transition-transform active:scale-90"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Input ── */}
      <div className={clsx("border-t transition-colors duration-200", theme.input)}>
        <div className="flex items-center gap-2 px-4 py-3">
          <span className={clsx("font-mono text-sm font-bold select-none", theme.prompt)}>{">"}</span>
          <input
            ref={inputRef}
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Escribir comando..." : "Desconectado"}
            disabled={!connected || sending}
            className={clsx("flex-1 bg-transparent font-mono text-sm outline-none transition-colors duration-200", theme.inputText)}
            autoComplete="off"
            spellCheck={false}
          />
          {sending ? (
            <Loader2 className={clsx("w-4 h-4 animate-spin", theme.prompt)} />
          ) : (
            <button
              onClick={sendCommand}
              disabled={!connected || !command.trim()}
              className={clsx("disabled:opacity-0 transition-colors", theme.prompt, "opacity-50 hover:opacity-100")}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex justify-between items-center px-4 pb-2">
          <span className={clsx("text-[9px] font-bold uppercase tracking-widest", theme.footerText)}>
            {connected ? "Conexión Segura" : "Sin Conexión"}
          </span>
          <span className={clsx("text-[10px] font-medium", theme.footerText)}>
            ↑↓ Historial · {logs.length}/500 líneas
          </span>
        </div>
      </div>

      <style>{theme.scrollbars}</style>
    </div>
  );
}

export default GameServerConsole;
