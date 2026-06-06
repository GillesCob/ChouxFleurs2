import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IUser } from '@/types';

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<IUser[]>('/users'),
  });
}
