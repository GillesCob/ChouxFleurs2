import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Gift, LayoutDashboard, LogOut, Settings, Sparkles, Trophy, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/pronostics", label: "Pronostics", icon: Sparkles },
  { to: "/liste-naissance", label: "Liste de naissance", icon: Gift },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const { projects, currentProject, setCurrentProjectId, isProjectOwner } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const winner = currentProject?.winner ?? null;
  const hasResult = !!currentProject?.birthResult;

  return (
    <div className="flex min-h-screen flex-col">
      {hasResult && winner && (
        <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 py-2 text-center text-sm font-medium text-yellow-900">
          <Trophy className="mr-1.5 inline h-4 w-4" />
          Gagnant : <span className="font-bold">{winner.authorName}</span> avec{" "}
          <span className="font-bold">{winner.score} pts</span> — Prénom :{" "}
          <span className="font-bold">{winner.firstName}</span>
          {winner.scoreDetails && (
            <span className="ml-2 opacity-75">
              (genre {winner.scoreDetails.gender} · prénom {winner.scoreDetails.firstName} · date{" "}
              {winner.scoreDetails.birthDate} · poids {winner.scoreDetails.weight} · taille {winner.scoreDetails.height}
              )
            </span>
          )}
        </div>
      )}

      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <img src="/public/Chouxfleur2noir.png" alt="ChouxFleurs2" className="h-20 w-20" />{" "}
            <span className="text-lg font-semibold text-tertiary">ChouxFleurs</span>
          </Link>

          {projects.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 max-w-[180px] truncate">
                  <span className="truncate">{currentProject?.name ?? "Projet"}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setCurrentProjectId(p.id)}
                    className={cn(p.id === currentProject?.id && "font-medium")}
                  >
                    {p.name}
                    {p.owner.id === user?.id && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        admin
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : currentProject ? (
            <span className="hidden text-sm font-medium text-muted-foreground md:block">
              {currentProject.name}
              {isProjectOwner && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  admin
                </Badge>
              )}
            </span>
          ) : null}

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2", location.pathname === to && "bg-muted font-medium")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2", location.pathname === "/admin" && "bg-muted font-medium")}
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden text-sm text-muted-foreground lg:block">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">{children}</main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">© 2026 ChouxFleurs2</footer>
    </div>
  );
}
