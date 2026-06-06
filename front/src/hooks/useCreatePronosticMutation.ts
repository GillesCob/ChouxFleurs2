import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IPronostic, ICreatePronosticDto } from '@/types';

export function useCreatePronosticMutation(projectId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ICreatePronosticDto) =>
      api.post<IPronostic>('/pronostics', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pronostics', projectId] });
    },
  });
}
