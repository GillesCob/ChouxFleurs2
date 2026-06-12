import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useDeleteMeMutation() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/users/me'),
    onSuccess: () => {
      queryClient.clear();
      logout();
    },
  });
}
