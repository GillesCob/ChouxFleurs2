import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IProject, IUpdateProjectDto } from '@/types';

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: number } & IUpdateProjectDto) =>
      api.patch<IProject>(`/projects/${id}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
