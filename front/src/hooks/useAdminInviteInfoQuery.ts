import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IInviteInfo } from './useInviteInfoQuery';

export function useAdminInviteInfoQuery(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-invite-info', token],
    queryFn: () => api.get<IInviteInfo>(`/projects/admin-invite/${token}`),
    enabled: !!token,
    retry: false,
  });
}
