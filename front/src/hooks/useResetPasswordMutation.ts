import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface IResetPasswordResponse {
  message: string;
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: IResetPasswordPayload) =>
      api.post<IResetPasswordResponse>('/auth/reset-password', payload),
  });
}
