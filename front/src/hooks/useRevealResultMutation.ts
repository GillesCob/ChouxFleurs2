import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IRevealResultDto } from '@/types';

export function useRevealResultMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: IRevealResultDto) =>
      api.post(`/projects/${projectId}/result`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['pronostics', projectId] });
    },
  });
}
