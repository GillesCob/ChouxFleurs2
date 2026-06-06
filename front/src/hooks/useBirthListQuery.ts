import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IBirthListItem } from '@/types';

export function useBirthListQuery(projectId: number | null) {
  return useQuery({
    queryKey: ['birth-list', projectId],
    queryFn: () => api.get<IBirthListItem[]>(`/birth-list?projectId=${projectId}`),
    enabled: projectId !== null,
  });
}
