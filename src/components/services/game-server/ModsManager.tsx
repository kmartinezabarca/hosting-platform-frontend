import React, { useState, useRef, useCallback, useEffect } from "react";
import clsx from "clsx";
import {
    UploadCloud,
    Trash2,
    RefreshCcw,
    File as FileIcon,
    AlertTriangle,
    Search,
    Download,
    Sun,
    Moon,
    Loader2,
    FolderOpen,
    X,
    Package,
    Store,
    CheckCircle2,
    ArrowDownToLine,
    Star,
    TrendingUp,
    ExternalLink,
    ChevronLeft,
    Power,
    ServerCrash,
} from "lucide-react";
import {
    useFileList,
    useDeleteFile,
    useDownloadFile,
    useUploadFile,
    usePowerServer,
} from "@/hooks/useFileManager";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

import { useRestartState } from "@/hooks/useRestartState";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    serviceUuid: string;
    eggName: string;
    restartServerRequired?: boolean;
    pendingChangesCount?: number;
}

type RestartState = "idle" | "confirming" | "restarting" | "done" | "dismissed";

interface ModrinthProject {
    project_id: string;
    slug: string;
    title: string;
    description: string;
    categories: string[];
    downloads: number;
    follows: number;
    icon_url: string | null;
    project_type: string;
    versions: string[];
    latest_version?: string;
    date_modified: string;
}

interface ModrinthVersion {
    id: string;
    name: string;
    version_number: string;
    game_versions: string[];
    loaders: string[];
    files: { url: string; filename: string; primary: boolean }[];
}

type TabId = "files" | "marketplace";
type InstallState =
    | "idle"
    | "fetching"
    | "downloading"
    | "uploading"
    | "done"
    | "error";

type InstalledProjectIndex = Record<string, {
    filename: string;
    slug: string;
    title: string;
}>;

type ConfirmAction = {
    type: "delete" | "uninstall";
    filename: string;
} | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const detectDirectory = (egg: string) => {
    const e = egg.toLowerCase();
    if (e.includes("forge") || e.includes("fabric")) return "/mods";
    if (e.includes("spigot") || e.includes("paper") || e.includes("bukkit"))
        return "/plugins";
    return "/";
};

const detectLabel = (dir: string) => {
    if (dir === "/mods") return "Mods";
    if (dir === "/plugins") return "Plugins";
    return "Archivos";
};

const getModrinthFacet = (dir: string) => {
    if (dir === "/mods") return "mod";
    if (dir === "/plugins") return "plugin";
    return "plugin";
};

function fmtSize(bytes: number) {
    if (bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function fmtDownloads(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
}

/** Normaliza string para comparación fuzzy (sin espacios, signos ni versiones) */
function normalize(s: string) {
    return s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\.jar$/i, "")
        .replace(/\b(?:mc|v)?\d+(?:[._-]\d+)*\b/g, "")
        .replace(/[^a-z]/g, "");
}

function meaningfulTokens(...values: string[]) {
    const ignored = new Set([
        "minecraft", "server", "plugin", "plugins", "mod", "mods",
        "paper", "spigot", "bukkit", "purpur", "folia",
        "fabric", "forge", "neoforge", "quilt",
    ]);

    return Array.from(new Set(
        values
            .flatMap(value => value.toLowerCase().split(/[^a-z0-9]+/i))
            .map(token => normalize(token))
            .filter(token => token.length >= 4 && !ignored.has(token))
    ));
}

function getInstalledStorageKey(serviceUuid: string, directory: string) {
    return `mods-manager:installed:${serviceUuid}:${directory}`;
}

function loadInstalledIndex(serviceUuid: string, directory: string): InstalledProjectIndex {
    if (typeof window === "undefined" || !serviceUuid) return {};
    try {
        const raw = window.localStorage.getItem(getInstalledStorageKey(serviceUuid, directory));
        if (!raw) return {};
        return JSON.parse(raw) as InstalledProjectIndex;
    } catch {
        return {};
    }
}

function saveInstalledIndex(serviceUuid: string, directory: string, index: InstalledProjectIndex) {
    if (typeof window === "undefined" || !serviceUuid) return;
    window.localStorage.setItem(getInstalledStorageKey(serviceUuid, directory), JSON.stringify(index));
}

/**
 * Retorna el filename instalado si hay un archivo que coincide
 * con el slug o título del proyecto de Modrinth.
 */
function findInstalledFile(
    project: ModrinthProject,
    files: { name: string }[],
    installedIndex: InstalledProjectIndex = {},
): string | null {
    const fileNames = new Set(files.map(file => file.name));
    const indexed = installedIndex[project.project_id]?.filename;
    if (indexed && fileNames.has(indexed)) return indexed;

    const slugN   = normalize(project.slug);
    const titleN  = normalize(project.title);
    const tokens  = meaningfulTokens(project.slug, project.title);
    let bestMatch: { name: string; score: number } | null = null;

    for (const f of files) {
        const fileN = normalize(f.name.replace(/\.jar$/i, ""));
        if (
            fileN.includes(slugN)  || slugN.includes(fileN) ||
            fileN.includes(titleN) || titleN.includes(fileN)
        ) {
            return f.name;
        }

        const tokenMatches = tokens.filter(token => fileN.includes(token)).length;
        const score = tokenMatches / Math.max(tokens.length, 1);
        if (tokenMatches >= 2 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { name: f.name, score };
        }
    }
    return bestMatch?.name ?? null;
}

// ─── Modrinth API ─────────────────────────────────────────────────────────────

async function searchModrinth(
    query: string,
    projectType: string,
): Promise<ModrinthProject[]> {
    const facets = JSON.stringify([[`project_type:${projectType}`]]);
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&facets=${encodeURIComponent(facets)}&limit=20`;
    const res = await fetch(url, { headers: { "User-Agent": "GamePanel/1.0" } });
    if (!res.ok) throw new Error("Error al buscar en Modrinth");
    const data = await res.json();
    return data.hits as ModrinthProject[];
}

async function fetchLatestVersion(
    projectId: string,
    loaders: string[],
): Promise<ModrinthVersion | null> {
    for (const loader of loaders) {
        const url = `https://api.modrinth.com/v2/project/${projectId}/version?loaders=${encodeURIComponent(JSON.stringify([loader]))}`;
        const res = await fetch(url, { headers: { "User-Agent": "GamePanel/1.0" } });
        if (!res.ok) continue;
        const versions: ModrinthVersion[] = await res.json();
        if (versions.length > 0) return versions[0];
    }
    return null;
}

const PLUGIN_LOADERS = ["paper", "spigot", "bukkit", "purpur", "folia"];
const MOD_LOADERS    = ["fabric", "forge", "neoforge", "quilt"];

// ─── Theme ────────────────────────────────────────────────────────────────────

const dark = {
    wrap: "bg-[#0d1117] border-white/10 text-white",
    header: "border-white/[0.06]",
    label: "text-white",
    sublabel: "text-slate-400",
    dropzone: "border-white/10 hover:border-emerald-400 bg-white/[0.02]",
    dropText: "text-slate-400",
    dropLink: "text-emerald-400",
    searchWrap: "bg-white/[0.05] border-white/10 text-white placeholder-slate-500 focus:border-emerald-500/60",
    row: "hover:bg-white/[0.05]",
    rowName: "text-slate-200",
    rowMeta: "text-slate-500",
    footer: "text-amber-400 border-white/[0.06]",
    empty: "text-slate-500",
    btnIcon: "text-slate-400 hover:text-white",
    deleteBtn: "hover:bg-rose-500/10 text-rose-400",
    downloadBtn: "hover:bg-sky-500/10 text-sky-400",
    tab: "bg-white/[0.05] text-slate-400",
    tabActive: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    card: "bg-white/[0.03] border border-white/[0.07] hover:border-emerald-500/30",
    cardTitle: "text-slate-100",
    cardDesc: "text-slate-500",
    cardMeta: "text-slate-600",
    installBtn: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20",
    installedBtn: "bg-white/[0.04] text-slate-500 border border-white/10 cursor-default",
    errorBadge: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    scrollbar: `
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
  `,
};

const light: typeof dark = {
    wrap: "bg-white border-neutral-200 text-neutral-900",
    header: "border-neutral-100",
    label: "text-neutral-900",
    sublabel: "text-neutral-400",
    dropzone: "border-neutral-200 hover:border-emerald-400 bg-neutral-50",
    dropText: "text-neutral-400",
    dropLink: "text-emerald-600",
    searchWrap: "bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-emerald-400",
    row: "hover:bg-neutral-50",
    rowName: "text-neutral-800",
    rowMeta: "text-neutral-400",
    footer: "text-amber-600 border-neutral-100",
    empty: "text-neutral-400",
    btnIcon: "text-neutral-400 hover:text-neutral-700",
    deleteBtn: "hover:bg-rose-50 text-rose-500",
    downloadBtn: "hover:bg-sky-50 text-sky-500",
    tab: "bg-neutral-100 text-neutral-500",
    tabActive: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    card: "bg-neutral-50 border border-neutral-200 hover:border-emerald-300",
    cardTitle: "text-neutral-800",
    cardDesc: "text-neutral-500",
    cardMeta: "text-neutral-400",
    installBtn: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200",
    installedBtn: "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-default",
    errorBadge: "bg-rose-50 text-rose-500 border border-rose-200",
    scrollbar: `
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.18); }
  `,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ pct, isDark }: { pct: number; isDark: boolean }) {
    return (
        <div className={clsx("rounded-xl overflow-hidden transition-all duration-300", isDark ? "bg-white/[0.05] border border-white/10" : "bg-neutral-100 border border-neutral-200")}>
            <div className="flex items-center justify-between px-3 py-2">
                <span className={clsx("text-xs font-medium", isDark ? "text-slate-300" : "text-neutral-600")}>Subiendo archivo…</span>
                <span className={clsx("text-xs font-bold tabular-nums", isDark ? "text-emerald-400" : "text-emerald-600")}>{pct}%</span>
            </div>
            <div className={clsx("h-1", isDark ? "bg-white/5" : "bg-neutral-200")}>
                <div className="h-full bg-emerald-500 transition-all duration-200 rounded-full" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function FileRow({ file, isDark, onDelete, onDownload, deleting, downloading }: {
    file: { name: string; size: number; modified_at: string };
    isDark: boolean;
    onDelete: () => void;
    onDownload: () => void;
    deleting: boolean;
    downloading: boolean;
}) {
    const t = isDark ? dark : light;
    const date = new Date(file.modified_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <div className={clsx("flex items-center justify-between px-3 py-2 rounded-lg transition-colors group", t.row)}>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <FileIcon className={clsx("w-4 h-4 shrink-0", isDark ? "text-slate-500" : "text-neutral-400")} />
                <span className={clsx("text-xs truncate font-medium", t.rowName)}>{file.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className={clsx("text-[11px] hidden sm:block tabular-nums", t.rowMeta)}>{fmtSize(file.size)}</span>
                <span className={clsx("text-[11px] hidden md:block", t.rowMeta)}>{date}</span>
                <button onClick={onDownload} disabled={downloading} title="Descargar" className={clsx("p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100", t.downloadBtn)}>
                    {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                </button>
                <button onClick={onDelete} disabled={deleting} title="Eliminar" className={clsx("p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100", t.deleteBtn)}>
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}

// ─── Marketplace card ─────────────────────────────────────────────────────────

function MarketplaceCard({
    project, isDark, installState, installProgress, errorMsg,
    installedFile, onInstall, onUninstall,
}: {
    project: ModrinthProject;
    isDark: boolean;
    installState: InstallState;
    installProgress: number;
    errorMsg: string;
    installedFile: string | null;        // filename si ya está instalado
    onInstall: (project: ModrinthProject) => void;
    onUninstall: (filename: string) => void;
}) {
    const t = isDark ? dark : light;
    const isInstalling = installState === "fetching" || installState === "downloading" || installState === "uploading";
    // Mostrar como instalado si la sesión lo marcó O si ya existe el archivo
    const isDone  = installState === "done" || (installState === "idle" && !!installedFile);
    const isError = installState === "error";

    const stateLabel: Record<InstallState, string> = {
        idle: "Instalar", fetching: "Buscando…", downloading: "Descargando…",
        uploading: "Subiendo…", done: "Instalado", error: "Reintentar",
    };

    return (
        <div className={clsx("rounded-xl p-3 transition-all duration-200 flex flex-col gap-2.5", t.card)}>
            {/* Top row */}
            <div className="flex items-start gap-2.5">
                <div className={clsx("w-9 h-9 rounded-lg shrink-0 overflow-hidden flex items-center justify-center", isDark ? "bg-white/[0.05]" : "bg-neutral-100")}>
                    {project.icon_url
                        ? <img src={project.icon_url} alt="" className="w-full h-full object-cover" />
                        : <Package className={clsx("w-4 h-4", isDark ? "text-slate-500" : "text-neutral-400")} />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className={clsx("text-xs font-semibold truncate", t.cardTitle)}>{project.title}</span>
                        <a href={`https://modrinth.com/project/${project.slug}`} target="_blank" rel="noopener noreferrer"
                            className={clsx("shrink-0 opacity-40 hover:opacity-80 transition-opacity", isDark ? "text-slate-400" : "text-neutral-400")}>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <p className={clsx("text-[11px] line-clamp-2 mt-0.5 leading-relaxed", t.cardDesc)}>{project.description}</p>
                </div>
            </div>

            {/* Stats */}
            <div className={clsx("flex items-center gap-3 text-[11px]", t.cardMeta)}>
                <span className="flex items-center gap-1"><ArrowDownToLine className="w-3 h-3" />{fmtDownloads(project.downloads)}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{fmtDownloads(project.follows)}</span>
                {project.categories.slice(0, 2).map((c) => (
                    <span key={c} className={clsx("px-1.5 py-0.5 rounded-md text-[10px] font-medium", isDark ? "bg-white/[0.05] text-slate-400" : "bg-neutral-200 text-neutral-500")}>{c}</span>
                ))}
            </div>

            {/* Install progress */}
            {isInstalling && (
                <div className={clsx("rounded-lg overflow-hidden", isDark ? "bg-white/[0.04]" : "bg-neutral-100")}>
                    <div className="flex items-center justify-between px-2 py-1.5">
                        <span className={clsx("text-[11px]", isDark ? "text-slate-400" : "text-neutral-500")}>{stateLabel[installState]}</span>
                        <span className={clsx("text-[11px] font-bold tabular-nums", isDark ? "text-emerald-400" : "text-emerald-600")}>{installProgress}%</span>
                    </div>
                    <div className={clsx("h-0.5", isDark ? "bg-white/5" : "bg-neutral-200")}>
                        <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${installProgress}%` }} />
                    </div>
                </div>
            )}

            {/* Error badge */}
            {isError && (
                <div className={clsx("rounded-lg overflow-hidden", t.errorBadge)}>
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="text-[11px] font-medium">Error de instalación</span>
                    </div>
                    {errorMsg && (
                        <div className={clsx("px-2 pb-2 text-[10px] font-mono leading-relaxed break-all", isDark ? "text-rose-300/70" : "text-rose-600/70")}>
                            {errorMsg}
                        </div>
                    )}
                </div>
            )}

            {/* ── Install / Uninstall button ── */}
            {isDone ? (
                <div className="flex gap-1.5">
                    {/* Instalado badge */}
                    <div className={clsx("flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5", t.installedBtn)}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instalado
                    </div>
                    {/* Uninstall */}
                    <button
                        onClick={() => installedFile && onUninstall(installedFile)}
                        title={`Desinstalar ${installedFile ?? ""}`}
                        className={clsx(
                            "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1",
                            isDark
                                ? "bg-rose-500/5 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15"
                                : "bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100"
                        )}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => !isInstalling && onInstall(project)}
                    disabled={isInstalling}
                    className={clsx(
                        "w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5",
                        isError       ? t.installBtn :
                        isInstalling  ? (isDark ? "bg-emerald-500/5 text-emerald-500/50 border border-emerald-500/10 cursor-wait" : "bg-emerald-50 text-emerald-400 border border-emerald-100 cursor-wait") :
                                        t.installBtn
                    )}
                >
                    {isInstalling
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {stateLabel[installState]}</>
                        : <><ArrowDownToLine className="w-3.5 h-3.5" /> {isError ? "Reintentar" : "Instalar"}</>
                    }
                </button>
            )}
        </div>
    );
}

// ─── Marketplace panel ────────────────────────────────────────────────────────

function MarketplacePanel({
    directory, isDark, files, upload, onUninstall,
    installStates, installProgress, installErrors,
    installedIndex, onInstalled,
    setInstallStates, setInstallProgress, setInstallErrors,
}: {
    directory: string;
    isDark: boolean;
    files: { name: string }[];
    upload: (file: File) => Promise<void>;
    onUninstall: (filename: string) => void;
    installedIndex: InstalledProjectIndex;
    onInstalled: (project: ModrinthProject, filename: string) => void;
    // Lifted al padre para sobrevivir cambios de tab
    installStates: Record<string, InstallState>;
    installProgress: Record<string, number>;
    installErrors: Record<string, string>;
    setInstallStates: React.Dispatch<React.SetStateAction<Record<string, InstallState>>>;
    setInstallProgress: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    setInstallErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
    const t = isDark ? dark : light;
    const projectType = getModrinthFacet(directory);

    const [query, setQuery]             = useState("");
    const [results, setResults]         = useState<ModrinthProject[]>([]);
    const [searching, setSearching]     = useState(false);
    const [searchErr, setSearchErr]     = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        handleSearch("", true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directory]);

    const handleSearch = useCallback(async (q: string, silent = false) => {
        if (!silent) setSearching(true);
        setSearchErr(null);
        try {
            const hits = await searchModrinth(q, projectType);
            setResults(hits);
            setHasSearched(true);
        } catch (e) {
            setSearchErr((e as Error).message);
        } finally {
            setSearching(false);
        }
    }, [projectType]);

    const handleInstall = useCallback(async (project: ModrinthProject) => {
        const pid = project.project_id;
        const setS = (s: InstallState) => setInstallStates(prev => ({ ...prev, [pid]: s }));
        const setP = (p: number)       => setInstallProgress(prev => ({ ...prev, [pid]: p }));
        const setE = (msg: string) => {
            console.error(`[Marketplace] ${project.title} →`, msg);
            setInstallErrors(prev => ({ ...prev, [pid]: msg }));
        };

        try {
            setS("fetching"); setP(10);
            setInstallErrors(prev => ({ ...prev, [pid]: "" }));

            const loaders = directory === "/mods" ? MOD_LOADERS : PLUGIN_LOADERS;
            let version   = await fetchLatestVersion(pid, loaders);

            if (!version) {
                const url = `https://api.modrinth.com/v2/project/${pid}/version`;
                const res = await fetch(url, { headers: { "User-Agent": "GamePanel/1.0" } });
                if (!res.ok) { setE(`GET /version → HTTP ${res.status} ${res.statusText}`); setS("error"); return; }
                const versions: ModrinthVersion[] = await res.json();
                if (versions.length === 0) {
                    setE(`No hay versiones publicadas en Modrinth para "${project.title}" (project_id: ${pid}). Loaders probados: ${loaders.join(", ")}`);
                    setS("error"); return;
                }
                version = versions[0];
            }

            console.info(`[Marketplace] ${project.title} → ${version.version_number} (loaders: ${version.loaders.join(", ")})`);

            const primaryFile = version.files.find(f => f.primary) ?? version.files[0];
            if (!primaryFile) { setE(`La versión ${version.version_number} no tiene archivos adjuntos.`); setS("error"); return; }

            setS("downloading"); setP(35);
            const fileRes = await fetch(primaryFile.url);
            if (!fileRes.ok) { setE(`Descarga fallida → ${primaryFile.url} (HTTP ${fileRes.status})`); setS("error"); return; }

            setP(70);
            const blob = await fileRes.blob();
            if (blob.size === 0) { setE(`El archivo descargado está vacío (0 bytes): ${primaryFile.filename}`); setS("error"); return; }

            const file = new File([blob], primaryFile.filename, { type: "application/java-archive" });
            setS("uploading"); setP(80);
            await upload(file);
            onInstalled(project, primaryFile.filename);
            setP(100); setS("done");
        } catch (err) {
            setE(`Excepción inesperada: ${err instanceof Error ? err.message : String(err)}`);
            setS("error");
        }
    }, [directory, upload, onInstalled]);

    return (
        <div className="space-y-3">
            {/* Search */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch(query)}
                        placeholder={`Buscar ${projectType === "mod" ? "mods" : "plugins"} en Modrinth…`}
                        className={clsx("w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-colors", t.searchWrap)}
                    />
                </div>
                <button onClick={() => handleSearch(query)} disabled={searching}
                    className={clsx("px-3 py-2 rounded-xl text-xs font-semibold transition-colors", t.installBtn)}>
                    {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Buscar"}
                </button>
            </div>

            {!hasSearched && (
                <div className={clsx("text-[11px] flex items-center gap-1.5", t.cardMeta)}>
                    <TrendingUp className="w-3 h-3" /> Cargando populares…
                </div>
            )}

            {searchErr && (
                <div className={clsx("text-xs px-3 py-2 rounded-xl flex items-center gap-2", t.errorBadge)}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {searchErr}
                </div>
            )}

            {/* Results */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-0.5">
                {searching && results.length === 0 ? (
                    <div className="flex items-center justify-center py-10 gap-2">
                        <Loader2 className={clsx("w-4 h-4 animate-spin", isDark ? "text-slate-400" : "text-neutral-400")} />
                        <span className={clsx("text-xs", t.empty)}>Buscando en Modrinth…</span>
                    </div>
                ) : results.length === 0 && hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Store className={clsx("w-8 h-8 opacity-30", isDark ? "text-slate-400" : "text-neutral-400")} />
                        <span className={clsx("text-xs", t.empty)}>Sin resultados</span>
                    </div>
                ) : (
                    results.map(project => (
                        <MarketplaceCard
                            key={project.project_id}
                            project={project}
                            isDark={isDark}
                            installState={installStates[project.project_id] ?? "idle"}
                            installProgress={installProgress[project.project_id] ?? 0}
                            errorMsg={installErrors[project.project_id] ?? ""}
                            installedFile={findInstalledFile(project, files, installedIndex)}
                            onInstall={handleInstall}
                            onUninstall={onUninstall}
                        />
                    ))
                )}
            </div>

            {results.length > 0 && (
                <p className={clsx("text-[10px] text-center", t.cardMeta)}>
                    Resultados de{" "}
                    <a href="https://modrinth.com" target="_blank" rel="noopener noreferrer"
                        className={clsx("underline underline-offset-2", isDark ? "text-slate-500 hover:text-slate-400" : "text-neutral-400 hover:text-neutral-500")}>
                        Modrinth
                    </a>
                </p>
            )}
        </div>
    );
}

// ─── Restart banner ───────────────────────────────────────────────────────────

function RestartBanner({ isDark, installedCount, restartState, onRestart, onDismiss }: {
    isDark: boolean;
    installedCount: number;
    restartState: RestartState;
    onRestart: () => void;
    onDismiss: () => void;
}) {
    const isRestarting = restartState === "restarting";
    const isDone       = restartState === "done";

    return (
        <div className={clsx("rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all duration-300",
            isDark ? "bg-amber-500/[0.08] border border-amber-500/20" : "bg-amber-50 border border-amber-200")}>
            <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isDark ? "bg-amber-500/10" : "bg-amber-100")}>
                {isDone       ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                : isRestarting ? <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                :                <ServerCrash className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className={clsx("text-xs font-semibold", isDark ? "text-amber-300" : "text-amber-700")}>
                    {isDone ? "Servidor reiniciando…" : `${installedCount} cambio${installedCount > 1 ? "s" : ""} pendiente${installedCount > 1 ? "s" : ""}`}
                </p>
                <p className={clsx("text-[11px] mt-0.5", isDark ? "text-amber-400/70" : "text-amber-600/70")}>
                    {isDone ? "Los cambios estarán activos en unos segundos." : "Reinicia el servidor para que los cambios surtan efecto."}
                </p>
            </div>
            {!isDone && (
                <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={onRestart} disabled={isRestarting}
                        className={clsx("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                            isDark ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 disabled:opacity-50"
                                   : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 disabled:opacity-50")}>
                        {isRestarting ? <><Loader2 className="w-3 h-3 animate-spin" /> Reiniciando…</> : <><Power className="w-3 h-3" /> Reiniciar ahora</>}
                    </button>
                    {!isRestarting && (
                        <button onClick={onDismiss} title="Después"
                            className={clsx("p-1.5 rounded-lg transition-colors",
                                isDark ? "text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10" : "text-amber-500 hover:bg-amber-100")}>
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FileManager({ serviceUuid, eggName, restartServerRequired, pendingChangesCount }: Props) {
    const directory = detectDirectory(eggName);
    const label     = detectLabel(directory);

    const [isDark, setIsDark]   = useState(false);
    const [tab, setTab]         = useState<TabId>("files");
    const [search, setSearch]   = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [deletingFile, setDeletingFile]       = useState<string | null>(null);
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    // Marketplace install state — lifted aquí para sobrevivir cambios de tab
    const [installStates, setInstallStates]     = useState<Record<string, InstallState>>({});
    const [installProgress, setInstallProgress] = useState<Record<string, number>>({});
    const [installErrors, setInstallErrors]     = useState<Record<string, string>>({});
    const [installedIndex, setInstalledIndex]   = useState<InstalledProjectIndex>(() => loadInstalledIndex(serviceUuid, directory));

    const { restartRequired, pendingCount, markPending } = useRestartState(serviceUuid);
    const effectiveRestartRequired = restartRequired ?? restartServerRequired;
    const effectivePendingCount    = pendingCount    ?? pendingChangesCount;

    const [restartState, setRestartState] = useState<RestartState>("idle");
    const [installedCount, setInstalledCount] = useState(0);

    useEffect(() => {
        setRestartState(effectiveRestartRequired ? "confirming" : "idle");
    }, [effectiveRestartRequired]);

    useEffect(() => {
        setInstalledCount(effectivePendingCount ?? 0);
    }, [effectivePendingCount]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: files = [], isLoading, error, refetch } = useFileList(serviceUuid, directory);
    const { mutateAsync: deleteFiles }  = useDeleteFile(serviceUuid, directory);
    const { mutateAsync: downloadFile } = useDownloadFile(serviceUuid, directory);
    const { upload, progress }          = useUploadFile(serviceUuid, directory);
    const { mutateAsync: powerAction }  = usePowerServer(serviceUuid);

    const t = isDark ? dark : light;
    const filtered = search ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : files;

    useEffect(() => {
        setInstalledIndex(loadInstalledIndex(serviceUuid, directory));
    }, [serviceUuid, directory]);

    const rememberMarketplaceInstall = useCallback((project: ModrinthProject, filename: string) => {
        setInstalledIndex(prev => {
            const next = {
                ...prev,
                [project.project_id]: {
                    filename,
                    slug: project.slug,
                    title: project.title,
                },
            };
            saveInstalledIndex(serviceUuid, directory, next);
            return next;
        });
    }, [directory, serviceUuid]);

    const forgetInstalledFilename = useCallback((filename: string) => {
        setInstalledIndex(prev => {
            const next = Object.fromEntries(
                Object.entries(prev).filter(([, value]) => value.filename !== filename)
            ) as InstalledProjectIndex;
            saveInstalledIndex(serviceUuid, directory, next);
            return next;
        });
    }, [directory, serviceUuid]);

    const handleUpload = useCallback(async (file: File) => {
        await upload(file);
        setInstalledCount(prev => prev + 1);
        setRestartState("confirming");
        await markPending();
    }, [upload, markPending]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    }, [handleUpload]);

    const runDelete = useCallback(async (name: string) => {
        setDeletingFile(name);
        try {
            await deleteFiles([name]);
            forgetInstalledFilename(name);
            setInstalledCount(prev => prev + 1);
            setRestartState("confirming");
            await markPending();
        } finally {
            setDeletingFile(null);
        }
    }, [deleteFiles, forgetInstalledFilename, markPending]);

    const handleDelete = useCallback((name: string) => {
        setConfirmAction({ type: "delete", filename: name });
    }, []);

    const handleDownload = useCallback(async (name: string) => {
        setDownloadingFile(name);
        try { await downloadFile(name); }
        finally { setDownloadingFile(null); }
    }, [downloadFile]);

    // Marketplace upload — mismo trigger que manual
    const marketplaceUpload = useCallback(async (file: File) => {
        await upload(file);
        setInstalledCount(prev => prev + 1);
        setRestartState("confirming");
        await markPending();
    }, [upload, markPending]);

    // Uninstall desde marketplace — también requiere reinicio
    const handleMarketplaceUninstall = useCallback((filename: string) => {
        setConfirmAction({ type: "uninstall", filename });
    }, []);

    const handleConfirmAction = useCallback(async () => {
        if (!confirmAction) return;
        try {
            await runDelete(confirmAction.filename);
            setConfirmAction(null);
        } catch {
            setConfirmAction(null);
        }
    }, [confirmAction, runDelete]);

    const handleRestart = useCallback(async () => {
        setRestartState("restarting");
        try {
            await powerAction("restart");
            setRestartState("done");
            setTimeout(() => setRestartState("dismissed"), 4000);
        } catch {
            setRestartState("confirming");
        }
    }, [powerAction]);

    const handleDismissRestart = useCallback(() => {
        setRestartState("dismissed");
    }, []);

    return (
        <>
        <div className={clsx("rounded-2xl border p-5 space-y-4 transition-colors duration-200", t.wrap)}>

            {/* ── Header ── */}
            <div className={clsx("flex items-center justify-between pb-3 border-b", t.header)}>
                <div>
                    <h3 className={clsx("text-sm font-semibold", t.label)}>{label}</h3>
                    <p className={clsx("text-xs mt-0.5", t.sublabel)}>
                        {directory} · {files.length} archivo{files.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsDark(!isDark)} title={isDark ? "Modo claro" : "Modo oscuro"}
                        className={clsx("p-2 rounded-lg transition-colors", t.btnIcon)}>
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button onClick={() => refetch()} disabled={isLoading}
                        className={clsx("p-2 rounded-lg transition-colors", t.btnIcon)}>
                        <RefreshCcw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1.5">
                {([
                    { id: "files",       icon: FolderOpen, label: label },
                    { id: "marketplace", icon: Store,       label: "Marketplace" },
                ] as const).map(({ id, icon: Icon, label: lbl }) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                            tab === id ? t.tabActive : t.tab)}>
                        <Icon className="w-3.5 h-3.5" />{lbl}
                    </button>
                ))}
            </div>

            {/* ── Restart banner ── */}
            {(restartState === "confirming" || restartState === "restarting" || restartState === "done") && (
                <RestartBanner
                    isDark={isDark}
                    installedCount={installedCount}
                    restartState={restartState}
                    onRestart={handleRestart}
                    onDismiss={handleDismissRestart}
                />
            )}

            {/* ── Files tab ── */}
            {tab === "files" && (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={`Buscar en ${label.toLowerCase()}…`}
                            className={clsx("w-full pl-9 pr-8 py-2 rounded-xl border text-xs outline-none transition-colors", t.searchWrap)} />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()}
                        className={clsx("border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200",
                            t.dropzone, dragOver && "border-emerald-400 scale-[1.01]", progress !== null && "pointer-events-none opacity-60")}>
                        <UploadCloud className={clsx("w-6 h-6 mx-auto mb-2 transition-colors", dragOver ? "text-emerald-400" : isDark ? "text-slate-500" : "text-neutral-400")} />
                        <p className={clsx("text-xs", t.dropText)}>
                            Arrastra un archivo aquí o{" "}
                            <span className={clsx("font-semibold cursor-pointer", t.dropLink)}>selecciona uno</span>
                        </p>
                        <input ref={fileInputRef} type="file" className="hidden"
                            onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
                    </div>

                    {progress !== null && <ProgressBar pct={progress} isDark={isDark} />}

                    {error && (
                        <div className="flex items-center gap-2 text-rose-400 text-xs p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{(error as Error).message ?? "Error al cargar archivos"}</span>
                        </div>
                    )}

                    <div className="space-y-0.5 max-h-[280px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-10 gap-2">
                                <Loader2 className={clsx("w-4 h-4 animate-spin", isDark ? "text-slate-400" : "text-neutral-400")} />
                                <span className={clsx("text-xs", t.empty)}>Cargando archivos…</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <FolderOpen className={clsx("w-8 h-8 opacity-30", isDark ? "text-slate-400" : "text-neutral-400")} />
                                <span className={clsx("text-xs", t.empty)}>
                                    {search ? "Sin resultados para tu búsqueda" : `No hay archivos en ${directory}`}
                                </span>
                                {!search && (
                                    <button onClick={() => setTab("marketplace")}
                                        className={clsx("text-xs font-medium flex items-center gap-1 mt-1",
                                            isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-500")}>
                                        <Store className="w-3.5 h-3.5" /> Instalar desde Marketplace
                                    </button>
                                )}
                            </div>
                        ) : (
                            filtered.map(file => (
                                <FileRow key={file.name} file={file} isDark={isDark}
                                    onDelete={() => handleDelete(file.name)}
                                    onDownload={() => handleDownload(file.name)}
                                    deleting={deletingFile === file.name}
                                    downloading={downloadingFile === file.name} />
                            ))
                        )}
                    </div>
                </>
            )}

            {/* ── Marketplace tab ── */}
            {tab === "marketplace" && (
                <MarketplacePanel
                    directory={directory}
                    isDark={isDark}
                    files={files}
                    upload={marketplaceUpload}
                    onUninstall={handleMarketplaceUninstall}
                    installedIndex={installedIndex}
                    onInstalled={rememberMarketplaceInstall}
                    installStates={installStates}
                    installProgress={installProgress}
                    installErrors={installErrors}
                    setInstallStates={setInstallStates}
                    setInstallProgress={setInstallProgress}
                    setInstallErrors={setInstallErrors}
                />
            )}

            <style>{t.scrollbar}</style>
        </div>
        <ConfirmationModal
            isOpen={!!confirmAction}
            onClose={() => !deletingFile && setConfirmAction(null)}
            onConfirm={handleConfirmAction}
            title={confirmAction?.type === "uninstall" ? "Desinstalar plugin" : "Eliminar archivo"}
            confirmText={confirmAction?.type === "uninstall" ? "Desinstalar" : "Eliminar"}
            isConfirming={!!deletingFile}
        >
            {confirmAction?.type === "uninstall"
                ? <>¿Seguro que quieres desinstalar <strong>{confirmAction.filename}</strong>? El servidor debe reiniciarse para aplicar el cambio.</>
                : <>¿Seguro que quieres eliminar <strong>{confirmAction?.filename}</strong>? Esta acción no se puede deshacer.</>}
        </ConfirmationModal>
        </>
    );
}
