import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminCategoriesService, {
  type AdminCategoryPayload,
  type AdminCategoriesParams,
} from '@infrastructure/services/adminCategoriesService';

export const adminCategoriesKeys = {
  all:  ['admin-categories'] as const,
  list: (params: AdminCategoriesParams) => [...adminCategoriesKeys.all, 'list', params] as const,
};

export const useAdminCategories = (params: AdminCategoriesParams = {}) =>
  useQuery({
    queryKey: adminCategoriesKeys.list(params),
    queryFn:  () => adminCategoriesService.getAll(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,   // keeps old data while fetching new page
  });

export const useCreateAdminCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCategoryPayload) => adminCategoriesService.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
  });
};

export const useUpdateAdminCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: AdminCategoryPayload }) =>
      adminCategoriesService.update(uuid, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
  });
};

export const useDeleteAdminCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => adminCategoriesService.delete(uuid),
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
  });
};
