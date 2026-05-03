import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fileManagerService } from "@/services/fileManagerService";

// ─── Query key factory ────────────────────────────────────────────────────────

const fileKeys = {
  all:  (uuid: string)                    => ["fileManager", uuid] as const,
  list: (uuid: string, dir: string)       => ["fileManager", uuid, "list", dir] as const,
};

// ─── useFileList ──────────────────────────────────────────────────────────────

/** Lista los archivos de un directorio con cache de 30 s */
export function useFileList(serviceUuid: string, directory: string) {
  return useQuery({
    queryKey: fileKeys.list(serviceUuid, directory),
    queryFn:  () => fileManagerService.listFiles(serviceUuid, directory),
    select:   (data) => data?.data ?? [],
    enabled:  !!serviceUuid,
    staleTime: 30_000,
    retry: false,
  });
}

// ─── usePowerServer ───────────────────────────────────────────────────────────
 
/** Envía una señal de poder al servidor (start / stop / restart / kill) */
export function usePowerServer(serviceUuid: string) {
  return useMutation({
    mutationFn: (signal: "start" | "stop" | "restart" | "kill") =>
      fileManagerService.sendPowerSignal(serviceUuid, signal),
  });
}


// ─── useDeleteFile ────────────────────────────────────────────────────────────

/** Elimina uno o varios archivos e invalida la lista */
export function useDeleteFile(serviceUuid: string, directory: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (files: string[]) =>
      fileManagerService.deleteFiles(serviceUuid, directory, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.list(serviceUuid, directory) });
    },
  });
}

// ─── useDownloadFile ──────────────────────────────────────────────────────────

/** Obtiene la URL firmada y dispara la descarga en el navegador */
export function useDownloadFile(serviceUuid: string, directory: string) {
  return useMutation({
    mutationFn: async (fileName: string) => {
      const res = await fileManagerService.getDownloadUrl(serviceUuid, directory, fileName);
      const url = res?.data?.url;
      if (!url) throw new Error("No download URL");
      // Abre la descarga sin navegar fuera
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  });
}

// ─── useUploadFile ────────────────────────────────────────────────────────────

/** Sube un archivo con progreso e invalida la lista al terminar */
export function useUploadFile(serviceUuid: string, directory: string) {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setProgress(0);
      try {
        // 1. Obtener URL firmada
        const urlRes = await fileManagerService.getUploadUrl(serviceUuid);
        const uploadUrl = urlRes?.data?.url;
        if (!uploadUrl) throw new Error("No upload URL");

        // 2. Subir con progreso
        await fileManagerService.uploadFileWithProgress(
          uploadUrl,
          directory,
          file,
          (pct) => setProgress(pct),
        );

        // 3. Refrescar lista
        await qc.invalidateQueries({ queryKey: fileKeys.list(serviceUuid, directory) });
      } finally {
        // Pequeño delay para que el usuario vea el 100 %
        setTimeout(() => setProgress(null), 800);
      }
    },
    [serviceUuid, directory, qc],
  );

  return { upload, progress };
}