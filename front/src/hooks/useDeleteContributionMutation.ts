import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDeleteContributionMutation(projectId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contributionId: number) =>
      api.delete(`/birth-list/contributions/${contributionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birth-list', projectId] });
    },
  });
}
