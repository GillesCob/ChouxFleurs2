import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Project } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProjectId: (id: number) => void;
  refreshProjects: () => Promise<void>;
  isProjectOwner: boolean;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProjectId, setCurrentProjectIdState] = useState<number | null>(
    () => {
      const stored = localStorage.getItem("currentProjectId");
      return stored ? parseInt(stored, 10) : null;
    }
  );

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.get<Project[]>("/projects/my");
      setProjects(data);
      if (
        data.length > 0 &&
        (!currentProjectId || !data.find((p) => p.id === currentProjectId))
      ) {
        setCurrentProjectIdState(data[0].id);
        localStorage.setItem("currentProjectId", String(data[0].id));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const setCurrentProjectId = (id: number) => {
    setCurrentProjectIdState(id);
    localStorage.setItem("currentProjectId", String(id));
  };

  const currentProject =
    projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;

  const isProjectOwner = !!(
    user &&
    currentProject &&
    currentProject.owner.id === user.id
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProjectId,
        refreshProjects: fetchProjects,
        isProjectOwner,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside ProjectProvider");
  return ctx;
}
