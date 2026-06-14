import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useProjectStore } from '@/store/projectStore';

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  const { currentProjectId, setCurrentProjectId } = useProjectStore();

  return useMutation({
    mutationFn: (projectId: number) => api.delete(`/projects/${projectId}`),
    onSuccess: (_, projectId) => {
      if (currentProjectId === projectId) setCurrentProjectId(null);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
