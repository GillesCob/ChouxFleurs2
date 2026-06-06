import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IPronostic } from '@/types';

export function usePronosticsQuery(projectId: number | null) {
  return useQuery({
    queryKey: ['pronostics', projectId],
    queryFn: () => api.get<IPronostic[]>(`/pronostics?projectId=${projectId}`),
    enabled: projectId !== null,
  });
}
