import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useProjectsQuery } from '@/hooks/useProjectsQuery';
import { useUsersQuery } from '@/hooks/useUsersQuery';
import { useUpdateProjectMutation } from '@/hooks/useUpdateProjectMutation';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Crown, Pencil, Users } from 'lucide-react';

const projectNameSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
});
type ProjectNameForm = z.infer<typeof projectNameSchema>;

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const { currentProjectId } = useProjectStore();
  const { data: projects = [] } = useProjectsQuery();
  const currentProject = projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;
  const isProjectOwner = !!(user && currentProject && currentProject.owner.id === user.id);
  const { data: users = [], isLoading } = useUsersQuery();
  const updateProjectMutation = useUpdateProjectMutation();
  const [openRename, setOpenRename] = useState(false);

  const {
    register: renameRegister,
    handleSubmit: renameHandleSubmit,
    reset: renameReset,
    formState: { errors: renameErrors, isSubmitting: renameSubmitting },
  } = useForm<ProjectNameForm>({ resolver: zodResolver(projectNameSchema) });

  const onRenameProject = async (data: ProjectNameForm) => {
    if (!currentProject) return;
    try {
      await updateProjectMutation.mutateAsync({ id: currentProject.id, name: data.name });
      toast({ title: 'Projet renommé !', description: `Nouveau nom : '${data.name}'` });
      renameReset();
      setOpenRename(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de renommer le projet',
      });
    }
  };

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

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

      {isProjectOwner && (
        <>
          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tous les utilisateurs</h2>
            <Card>
              <CardHeader>
                <CardDescription>Liste complète des comptes enregistrés.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {u.name}
                          {u.id === user?.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(vous)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {currentProject && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Projet actif : {currentProject.name}</h2>
              <Dialog open={openRename} onOpenChange={(open) => {
                setOpenRename(open);
                if (open) renameReset({ name: currentProject.name });
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-3.5 w-3.5" />
                    Renommer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Renommer le projet</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={renameHandleSubmit(onRenameProject)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="renameName">Nouveau nom</Label>
                      <Input id="renameName" {...renameRegister('name')} />
                      {renameErrors.name && (
                        <p className="text-xs text-destructive">{renameErrors.name.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={renameSubmitting}>
                      {renameSubmitting ? 'Renommage...' : 'Enregistrer'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                      <div key={m.id} className="px-6 py-3">
                        <p className="font-medium">{m.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Rejoint le {new Date(m.joinedAt).toLocaleDateString('fr-FR')}
                        </p>
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
