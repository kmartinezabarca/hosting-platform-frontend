// /hooks/useFileHandling.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { fmtBytes, isImageMime } from "../lib/chatUtils";

interface FileEntry {
  file: File;
  previewUrl: string;
}

interface UseFileHandlingOptions {
  allowedTypes: string[];
  maxSizeMB: number;
  fileLimit: number;
  disabled?: boolean;
}

export const useFileHandling = ({ allowedTypes, maxSizeMB, fileLimit, disabled = false }: UseFileHandlingOptions) => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string => {
    if (!allowedTypes.includes(f.type)) return `Tipo no permitido: ${f.name}`;
    if (f.size > maxSizeMB * 1024 * 1024)
      return `Archivo muy grande (${fmtBytes(f.size)}). Máx ${maxSizeMB} MB: ${f.name}`;
    return "";
  }, [allowedTypes, maxSizeMB]);

  const handleIncomingFiles = useCallback((fileList: FileList | File[] | null) => {
    if (disabled) return;
    const nextErrors: string[] = [];
    const incoming = Array.from(fileList || []);
    const currentCount = files.length;

    if (currentCount + incoming.length > fileLimit) {
      nextErrors.push(`Máximo ${fileLimit} archivos por mensaje.`);
    }

    const accepted: File[] = [];
    for (const f of incoming) {
      const err = validateFile(f);
      if (err) nextErrors.push(err);
      else accepted.push(f);
    }

    const slice = accepted.slice(0, Math.max(0, fileLimit - currentCount));
    const withPreview = slice.map((file) => ({
      file,
      previewUrl: isImageMime(file.type) ? URL.createObjectURL(file) : "",
    }));

    setFiles((prev) => [...prev, ...withPreview]);
    setFileErrors(nextErrors);
  }, [files.length, fileLimit, validateFile, disabled]);

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const clearFiles = () => {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setFileErrors([]);
  };

  // Efecto para drag & drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
    const onEnter = (e: Event) => { prevent(e); if (!disabled) setIsDragging(true); };
    const onOver = (e: Event) => { prevent(e); if (!disabled) setIsDragging(true); };
    const onLeave = (e: Event) => { prevent(e); setIsDragging(false); };
    const onDrop = (e: DragEvent) => {
      prevent(e);
      setIsDragging(false);
      if (disabled) return;
      if (e.dataTransfer?.files) handleIncomingFiles(e.dataTransfer.files);
    };

    el.addEventListener("dragenter", onEnter);
    el.addEventListener("dragover", onOver);
    el.addEventListener("dragleave", onLeave);
    el.addEventListener("drop", onDrop as EventListener);
    return () => {
      el.removeEventListener("dragenter", onEnter);
      el.removeEventListener("dragover", onOver);
      el.removeEventListener("dragleave", onLeave);
      el.removeEventListener("drop", onDrop as EventListener);
    };
  }, [handleIncomingFiles, disabled]);

  // Limpieza de URLs al desmontar
  useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, [files]);

  return {
    files,
    fileErrors,
    isDragging,
    handleIncomingFiles,
    removeFile,
    clearFiles,
    dropRef,
    fileInputRef,
  };
};
