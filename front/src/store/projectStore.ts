import { create } from 'zustand';

interface IProjectStore {
  currentProjectId: number | null;
  setCurrentProjectId: (id: number) => void;
}

export const useProjectStore = create<IProjectStore>((set) => ({
  currentProjectId: (() => {
    const stored = localStorage.getItem('currentProjectId');
    return stored ? parseInt(stored, 10) : null;
  })(),
  setCurrentProjectId: (id) => {
    localStorage.setItem('currentProjectId', String(id));
    set({ currentProjectId: id });
  },
}));
