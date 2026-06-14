import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useJoinAdminProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => api.post(`/projects/join-admin/${token}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
