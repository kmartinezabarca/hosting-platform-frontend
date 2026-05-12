import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminGameServerService from '@infrastructure/services/adminGameServerService';
import { fileManagerService } from '@infrastructure/services/fileManagerService';

const adminFileKeys = {
  list: (id: number | string, dir: string) => ['admin', 'game-servers', id, 'files', dir] as const,
};

export function useAdminFileList(id: number | string, directory: string) {
  return useQuery({
    queryKey: adminFileKeys.list(id, directory),
    queryFn:  () => adminGameServerService.listFiles(id, directory),
    select:   (data: any) => data?.data ?? [],
    enabled:  !!id,
    staleTime: 30_000,
    retry: false,
  });
}

export function useAdminDeleteFile(id: number | string, directory: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: string[]) => adminGameServerService.deleteFiles(id, directory, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminFileKeys.list(id, directory) });
    },
  });
}

export function useAdminDownloadFile(id: number | string, directory: string) {
  return useMutation({
    mutationFn: async (fileName: string) => {
      const res: any = await adminGameServerService.getDownloadUrl(id, directory, fileName);
      const url = res?.data?.url;
      if (!url) throw new Error('No download URL');
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  });
}

export function useAdminUploadFile(id: number | string, directory: string) {
  const qc = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);

  const upload = useCallback(async (file: File) => {
    setProgress(0);
    try {
      const urlRes: any = await adminGameServerService.getUploadUrl(id);
      const uploadUrl = urlRes?.data?.url;
      if (!uploadUrl) throw new Error('No upload URL');

      await fileManagerService.uploadFileWithProgress(uploadUrl, directory, file, (pct) => setProgress(pct));
      await qc.invalidateQueries({ queryKey: adminFileKeys.list(id, directory) });
    } finally {
      setTimeout(() => setProgress(null), 800);
    }
  }, [id, directory, qc]);

  return { upload, progress };
}
