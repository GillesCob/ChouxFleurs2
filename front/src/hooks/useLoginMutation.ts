import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { IAuthResponse } from '@/types';

interface ILoginPayload {
  email: string;
  password: string;
}

export function useLoginMutation() {
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: ILoginPayload) =>
      api.post<IAuthResponse>('/auth/login', payload),
    onSuccess: (data) => {
      setToken(data.access_token);
      setUser(data.user);
    },
  });
}
