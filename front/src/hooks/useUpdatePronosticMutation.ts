import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IPronostic } from '@/types';

interface IUpdatePronosticPayload {
  id: number;
  authorName: string;
  gender: 'boy' | 'girl' | 'surprise';
  birthDate: string;
  weightGrams: number;
  heightCm: number;
  firstName: string;
  message?: string;
}

export function useUpdatePronosticMutation(projectId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: IUpdatePronosticPayload) =>
      api.patch<IPronostic>(`/pronostics/${id}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pronostics', projectId] }),
  });
}
