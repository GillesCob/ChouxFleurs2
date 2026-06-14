import { create } from 'zustand';

interface IProjectStore {
  currentProjectId: number | null;
  setCurrentProjectId: (id: number | null) => void;
}

export const useProjectStore = create<IProjectStore>((set) => ({
  currentProjectId: (() => {
    const stored = localStorage.getItem('currentProjectId');
    return stored ? parseInt(stored, 10) : null;
  })(),
  setCurrentProjectId: (id) => {
    if (id === null) {
      localStorage.removeItem('currentProjectId');
    } else {
      localStorage.setItem('currentProjectId', String(id));
    }
    set({ currentProjectId: id });
  },
}));
