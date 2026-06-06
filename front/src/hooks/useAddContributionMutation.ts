import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IContribution, ICreateContributionDto } from '@/types';

export function useAddContributionMutation(projectId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, dto }: { itemId: number; dto: ICreateContributionDto }) =>
      api.post<IContribution>(`/birth-list/${itemId}/contributions`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birth-list', projectId] });
    },
  });
}
