import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { IAuthResponse } from '@/types';

interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  projectName?: string;
  inviteToken?: string;
}

export function useRegisterMutation() {
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: IRegisterPayload) =>
      api.post<IAuthResponse>('/auth/register', payload),
    onSuccess: (data) => {
      setToken(data.access_token);
      setUser(data.user);
    },
  });
}
