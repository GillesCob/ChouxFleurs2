import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface IInviteInfo {
  id: number;
  name: string;
  owner: { name: string };
}

export function useInviteInfoQuery(token: string | undefined) {
  return useQuery({
    queryKey: ['invite-info', token],
    queryFn: () => api.get<IInviteInfo>(`/projects/invite/${token}`),
    enabled: !!token,
    retry: false,
  });
}
