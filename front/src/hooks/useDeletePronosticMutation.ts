import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDeletePronosticMutation(projectId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`/pronostics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pronostics', projectId] });
    },
  });
}
