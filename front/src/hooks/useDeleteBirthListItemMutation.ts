import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDeleteBirthListItemMutation(projectId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`/birth-list/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birth-list', projectId] });
    },
  });
}
