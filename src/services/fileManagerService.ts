import apiClient from "./apiClient";
import type { ApiResponse } from "@/types/api";

export interface FileItem {
  name: string;
  size: number;
  modified_at: string;
  is_file: boolean;
  is_editable?: boolean;
  mimetype?: string;
}

export interface FileUploadUrlResponse {
  url: string;
}

export interface MessageResponse {
  message: string;
}


export const fileManagerService = {
  /** Lista archivos de un directorio */
  async listFiles(
    serviceUuid: string,
    directory: string,
  ): Promise<ApiResponse<FileItem[]>> {
    const response = await apiClient.get<ApiResponse<FileItem[]>>(
      `/services/${serviceUuid}/files/list`,
      { params: { directory } },
    );
    return response.data;
  },

  /** Obtiene la URL firmada para subir un archivo */
  async getUploadUrl(
    serviceUuid: string,
  ): Promise<ApiResponse<FileUploadUrlResponse>> {
    const response = await apiClient.get<ApiResponse<FileUploadUrlResponse>>(
      `/services/${serviceUuid}/files/upload`,
    );
    return response.data;
  },

  /** Elimina uno o varios archivos */
  async deleteFiles(
    serviceUuid: string,
    directory: string,
    files: string[],
  ): Promise<void> {
    await apiClient.post(`/services/${serviceUuid}/files/delete`, {
      root: directory,
      files,
    });
  },

  /** Descarga un archivo — retorna la URL de descarga */
  /** Descarga un archivo — retorna la URL de descarga */
  async getDownloadUrl(
    serviceUuid: string,
    directory: string,
    fileName: string,
  ): Promise<ApiResponse<{ url: string }>> {
    const cleanPath = `${directory.replace(/\/$/, "")}/${fileName}`.replace(
      "//",
      "/",
    );

    const response = await apiClient.get<ApiResponse<{ url: string }>>(
      `/services/${serviceUuid}/files/download`,
      {
        params: {
          file: encodeURIComponent(cleanPath),
        },
      },
    );

    return response.data;
  },

    /** Envía una señal de poder al servidor (start / stop / restart / kill) */
  async sendPowerSignal(
    serviceUuid: string,
    signal: "start" | "stop" | "restart" | "kill",
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/services/${serviceUuid}/game-server/power`,
      { signal },
    );
    return response.data;
  },

  /**
   * Sube un archivo con seguimiento de progreso.
   * Recibe la URL firmada (obtenida antes con getUploadUrl) y el File nativo.
   * Llama a onProgress(0‑100) mientras avanza.
   */
  uploadFileWithProgress(
    uploadUrl: string,
    directory: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("files", file);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      });

      xhr.addEventListener("error", () => reject(new Error("Network error")));

      xhr.open(
        "POST",
        `${uploadUrl}&directory=${encodeURIComponent(directory)}`,
      );
      xhr.send(formData);
    });
  },
};

export default fileManagerService;
