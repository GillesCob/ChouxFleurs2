import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useProjectStore } from '@/store/projectStore';
import type { IProject } from '@/types';

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  const { setCurrentProjectId } = useProjectStore();

  return useMutation({
    mutationFn: (name: string) =>
      api.post<IProject>('/projects', { name }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCurrentProjectId(project.id);
    },
  });
}
