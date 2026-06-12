import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useProjectsQuery } from '@/hooks/useProjectsQuery';
import { useUpdateMeMutation } from '@/hooks/useUpdateMeMutation';
import { useDeleteMeMutation } from '@/hooks/useDeleteMeMutation';
import { useUpdateProjectMutation } from '@/hooks/useUpdateProjectMutation';
import { useCreateProjectMutation } from '@/hooks/useCreateProjectMutation';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
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
import { Pencil, Plus, Trash2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
  email: z.string().email('Email invalide'),
});
type ProfileForm = z.infer<typeof profileSchema>;

const projectNameSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
});
type ProjectNameForm = z.infer<typeof projectNameSchema>;

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const { currentProjectId } = useProjectStore();
  const { data: projects = [] } = useProjectsQuery();
  const navigate = useNavigate();

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;
  const isProjectOwner = !!(user && currentProject && currentProject.owner.id === user.id);

  const updateMeMutation = useUpdateMeMutation();
  const deleteMeMutation = useDeleteMeMutation();
  const updateProjectMutation = useUpdateProjectMutation();
  const createProjectMutation = useCreateProjectMutation();

  const [openRename, setOpenRename] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  // Formulaire profil
  const {
    register: profileRegister,
    handleSubmit: profileHandleSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  // Formulaire renommage projet
  const {
    register: renameRegister,
    handleSubmit: renameHandleSubmit,
    reset: renameReset,
    formState: { errors: renameErrors, isSubmitting: renameSubmitting },
  } = useForm<ProjectNameForm>({ resolver: zodResolver(projectNameSchema) });

  // Formulaire création projet
  const {
    register: createRegister,
    handleSubmit: createHandleSubmit,
    reset: createReset,
    formState: { errors: createErrors, isSubmitting: createSubmitting },
  } = useForm<ProjectNameForm>({ resolver: zodResolver(projectNameSchema) });

  const onUpdateProfile = async (data: ProfileForm) => {
    try {
      await updateMeMutation.mutateAsync(data);
      toast({ title: 'Profil mis à jour !' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de mettre à jour le profil',
      });
    }
  };

  const onDeleteAccount = async () => {
    try {
      await deleteMeMutation.mutateAsync();
      navigate('/login');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de supprimer le compte',
      });
    }
  };

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

  const onCreateProject = async (data: ProjectNameForm) => {
    try {
      const project = await createProjectMutation.mutateAsync(data.name);
      toast({ title: 'Projet créé !', description: `'${project.name}' est prêt.` });
      createReset();
      setOpenCreate(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de créer le projet',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon compte</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      {/* Profil — accessible à tous */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mon profil</h2>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={profileHandleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom affiché</Label>
                <Input id="name" {...profileRegister('name')} />
                {profileErrors.name && (
                  <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" type="email" {...profileRegister('email')} />
                {profileErrors.email && (
                  <p className="text-xs text-destructive">{profileErrors.email.message}</p>
                )}
              </div>
              <Button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Suppression de compte */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Zone de danger</h2>
        <Card className="border-destructive/40">
          <CardHeader>
            <CardDescription>
              La suppression de votre compte est définitive. Toutes vos données seront effacées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Cette action est irréversible. Votre compte et toutes vos données seront définitivement supprimés.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="destructive"
                    onClick={onDeleteAccount}
                    disabled={deleteMeMutation.isPending}
                    className="w-full"
                  >
                    {deleteMeMutation.isPending ? 'Suppression...' : 'Oui, supprimer mon compte'}
                  </Button>
                  <Button variant="ghost" onClick={() => setOpenDelete(false)} className="w-full">
                    Annuler
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Projet actif — propriétaire uniquement */}
      {isProjectOwner && currentProject && (
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
      )}

      {/* Créer un projet — si aucun projet disponible */}
      {projects.length === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Créer un projet</h2>
          <Card>
            <CardHeader>
              <CardDescription>
                Vous n'avez pas encore de projet. Créez-en un pour commencer !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau projet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau projet bébé</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={createHandleSubmit(onCreateProject)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="createName">Nom du projet</Label>
                      <Input id="createName" placeholder="Bébé Martin 2026" {...createRegister('name')} />
                      {createErrors.name && (
                        <p className="text-xs text-destructive">{createErrors.name.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={createSubmitting}>
                      {createSubmitting ? 'Création...' : 'Créer le projet'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
