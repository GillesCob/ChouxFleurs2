import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { User } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Users } from "lucide-react";

export default function AdminPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const { currentProject } = useProject();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    api
      .get<User[]>("/users")
      .then(setUsers)
      .catch(() => toast({ variant: "destructive", title: "Erreur de chargement" }))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">Gestion des utilisateurs inscrits</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Crown className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Votre rôle</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-purple-100 text-purple-700">Admin système</Badge>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tous les utilisateurs</h2>
        <Card>
          <CardHeader>
            <CardDescription>
              Liste complète des comptes enregistrés.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {u.name}
                      {u.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (vous)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {currentProject && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Projet actif : {currentProject.name}
            </h2>
            <Card>
              <CardHeader>
                <CardDescription>
                  Membres ayant rejoint ce projet via le lien d'invitation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {currentProject.members && currentProject.members.length > 0 ? (
                  <div className="divide-y">
                    {currentProject.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between px-6 py-3"
                      >
                        <div>
                          <p className="font-medium">{m.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {m.user.email}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Rejoint le{" "}
                          {new Date(m.joinedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-6 py-4 text-sm text-muted-foreground">
                    Aucun membre pour l'instant. Partagez votre lien d'invitation !
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
