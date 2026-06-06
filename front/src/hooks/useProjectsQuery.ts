import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { IProject } from '@/types';

export function useProjectsQuery() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<IProject[]>('/projects/my'),
    enabled: !!user,
  });
}
