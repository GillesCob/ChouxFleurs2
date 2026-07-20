import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface IForgotPasswordPayload {
  email: string;
}

interface IForgotPasswordResponse {
  message: string;
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: IForgotPasswordPayload) =>
      api.post<IForgotPasswordResponse>('/auth/forgot-password', payload),
  });
}
