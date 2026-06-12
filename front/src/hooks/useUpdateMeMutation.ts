import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { IUser } from '@/types';

interface IUpdateMeDto {
  name?: string;
  email?: string;
}

export function useUpdateMeMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (dto: IUpdateMeDto) =>
      api.patch<IUser>('/users/me', dto),
    onSuccess: (updatedUser) => setUser(updatedUser),
  });
}
