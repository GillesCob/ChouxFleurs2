import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IBirthListItem, ICreateBirthListItemDto } from '@/types';

export function useAddBirthListItemMutation(projectId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ICreateBirthListItemDto) =>
      api.post<IBirthListItem>('/birth-list', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birth-list', projectId] });
    },
  });
}
