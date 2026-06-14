import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useProjectsQuery } from '@/hooks/useProjectsQuery';
import { useUpdateMeMutation } from '@/hooks/useUpdateMeMutation';
import { useDeleteMeMutation } from '@/hooks/useDeleteMeMutation';
import { useUpdateProjectMutation } from '@/hooks/useUpdateProjectMutation';
import { useCreateProjectMutation } from '@/hooks/useCreateProjectMutation';
import { useDeleteProjectMutation } from '@/hooks/useDeleteProjectMutation';
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
import { Switch } from '@/components/ui/switch';
import type { IProject } from '@/types';
import { ChevronDown, Link2, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
  email: z.string().email('Email invalide'),
});
type ProfileForm = z.infer<typeof profileSchema>;

const projectNameSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
});
type ProjectNameForm = z.infer<typeof projectNameSchema>;

const hintsSchema = z.object({
  termDate: z.string().optional(),
  hint: z.string().optional(),
});
type HintsForm = z.infer<typeof hintsSchema>;

// Formulaire d'indices inline par projet
function ProjectHintsForm({ project }: { project: IProject }) {
  const updateProjectMutation = useUpdateProjectMutation();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<HintsForm>({
    defaultValues: {
      termDate: project.termDate ?? '',
      hint: project.hint ?? '',
    },
  });

  const onSubmit = async (data: HintsForm) => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        termDate: data.termDate || null,
        hint: data.hint || null,
      });
      toast({ title: 'Indices mis à jour !' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de mettre à jour les indices',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`termDate-${project.id}`} className="text-sm">
          Date du terme
        </Label>
        <Input
          id={`termDate-${project.id}`}
          type="date"
          {...register('termDate')}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`hint-${project.id}`} className="text-sm">
          Autre indice
        </Label>
        <Input
          id={`hint-${project.id}`}
          placeholder="Ex : il aime déjà le foot…"
          {...register('hint')}
        />
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer les indices'}
      </Button>
    </form>
  );
}

function ProjectVisibilityToggles({ project }: { project: IProject }) {
  const updateProjectMutation = useUpdateProjectMutation();

  const toggle = async (field: 'pronosticsEnabled' | 'birthListEnabled', value: boolean) => {
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, [field]: value });
      toast({ title: 'Paramètre mis à jour !' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de mettre à jour',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">Section Pronostics</Label>
          <p className="text-xs text-muted-foreground">Visible par les participants</p>
        </div>
        <Switch
          checked={project.pronosticsEnabled}
          onCheckedChange={(v) => toggle('pronosticsEnabled', v)}
          disabled={updateProjectMutation.isPending}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">Liste de naissance</Label>
          <p className="text-xs text-muted-foreground">Visible par les participants</p>
        </div>
        <Switch
          checked={project.birthListEnabled}
          onCheckedChange={(v) => toggle('birthListEnabled', v)}
          disabled={updateProjectMutation.isPending}
        />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const navigate = useNavigate();

  const ownedProjects = projects.filter(
    (p) => p.owner.id === user?.id || p.members?.some((m) => m.user.id === user?.id && m.isAdmin),
  );
  const projectSectionTitle = ownedProjects.length > 1 ? 'Mes projets' : 'Mon projet';

  const updateMeMutation = useUpdateMeMutation();
  const deleteMeMutation = useDeleteMeMutation();
  const updateProjectMutation = useUpdateProjectMutation();
  const createProjectMutation = useCreateProjectMutation();

  const [renamingProjectId, setRenamingProjectId] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openProjectId, setOpenProjectId] = useState<number | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
  const deleteProjectMutation = useDeleteProjectMutation();
  const projectRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (openProjectId === null) return;
    const el = projectRefs.current[openProjectId];
    if (!el) return;
    const timer = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    return () => clearTimeout(timer);
  }, [openProjectId]);

  const {
    register: profileRegister,
    handleSubmit: profileHandleSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const {
    register: renameRegister,
    handleSubmit: renameHandleSubmit,
    reset: renameReset,
    formState: { errors: renameErrors, isSubmitting: renameSubmitting },
  } = useForm<ProjectNameForm>({ resolver: zodResolver(projectNameSchema) });

  const {
    register: createRegister,
    handleSubmit: createHandleSubmit,
    reset: createReset,
    formState: { errors: createErrors, isSubmitting: createSubmitting },
  } = useForm<ProjectNameForm>({ resolver: zodResolver(projectNameSchema) });

  const openRenameFor = (project: IProject) => {
    renameReset({ name: project.name });
    setRenamingProjectId(project.id);
  };

  const copyInviteLink = async (project: IProject) => {
    const url = `${window.location.origin}/invite/${project.inviteToken}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Lien copié !', description: 'Partagez-le avec vos proches.' });
  };

  const copyAdminLink = async (project: IProject) => {
    const url = `${window.location.origin}/admin-invite/${project.adminInviteToken}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Lien admin copié !', description: 'Partagez-le avec la personne à qui vous souhaitez donner les droits admin.' });
  };

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
    if (!renamingProjectId) return;
    try {
      await updateProjectMutation.mutateAsync({ id: renamingProjectId, name: data.name });
      toast({ title: 'Projet renommé !', description: `Nouveau nom : '${data.name}'` });
      setRenamingProjectId(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de renommer le projet',
      });
    }
  };

  const onDeleteProject = async () => {
    if (!deletingProjectId) return;
    try {
      await deleteProjectMutation.mutateAsync(deletingProjectId);
      toast({ title: 'Projet supprimé' });
      setDeletingProjectId(null);
      setOpenProjectId(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de supprimer le projet',
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

  if (projectsLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon compte</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      {/* Projets possédés */}
      {ownedProjects.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{projectSectionTitle}</h2>

          {/* Dialog de suppression — partagé entre tous les projets */}
          <Dialog
            open={deletingProjectId !== null}
            onOpenChange={(open) => { if (!open) setDeletingProjectId(null); }}
          >
            <DialogContent className="top-4 translate-y-0 sm:top-[50%] sm:-translate-y-1/2 sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Supprimer le projet</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible. Tous les pronostics, résultats et articles de la liste de naissance seront définitivement supprimés.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={onDeleteProject}
                  disabled={deleteProjectMutation.isPending}
                  className="w-full"
                >
                  {deleteProjectMutation.isPending ? 'Suppression...' : 'Oui, supprimer ce projet'}
                </Button>
                <Button variant="ghost" onClick={() => setDeletingProjectId(null)} className="w-full">
                  Annuler
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog de renommage — partagé entre tous les projets */}
          <Dialog
            open={renamingProjectId !== null}
            onOpenChange={(open) => { if (!open) setRenamingProjectId(null); }}
          >
            <DialogContent className="top-4 translate-y-0 sm:top-[50%] sm:-translate-y-1/2 sm:max-w-sm">
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

          {ownedProjects.length > 1 ? (
            <div className="space-y-2">
              {ownedProjects.map((project) => {
                const isOpen = openProjectId === project.id;
                return (
                  <div
                    key={project.id}
                    ref={(el) => { projectRefs.current[project.id] = el; }}
                    className="scroll-mt-[73px] overflow-hidden rounded-lg border"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenProjectId(isOpen ? null : project.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <span className="font-semibold">{project.name}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200${isOpen ? ' rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="space-y-3 border-t px-4 py-4">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => openRenameFor(project)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Renommer
                        </Button>
                        <Card>
                          <CardHeader>
                            <CardDescription>
                              Indices affichés aux participants avant qu'ils ne remplissent leur pronostic.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ProjectHintsForm project={project} />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardDescription>
                              Activez ou désactivez les sections visibles par les participants.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ProjectVisibilityToggles project={project} />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardDescription>
                              Membres ayant rejoint ce projet via le lien d'invitation.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            {project.members && project.members.length > 0 ? (
                              <div className="divide-y">
                                {project.members.map((m) => (
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
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button size="sm" className="gap-2" onClick={() => copyInviteLink(project)}>
                            <Link2 className="h-3.5 w-3.5" />
                            Lien d'invitation
                          </Button>
                          {project.owner.id === user?.id && (
                            <Button size="sm" className="gap-2" onClick={() => copyAdminLink(project)}>
                              <UserPlus className="h-3.5 w-3.5" />
                              Ajouter Admin
                            </Button>
                          )}
                        </div>
                        {project.owner.id === user?.id && (
                          <div className="pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeletingProjectId(project.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Supprimer ce projet
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            ownedProjects.map((project) => (
              <div key={project.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-base">{project.name}</h3>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => openRenameFor(project)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Renommer
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Indices affichés aux participants avant qu'ils ne remplissent leur pronostic.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectHintsForm project={project} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Activez ou désactivez les sections visibles par les participants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectVisibilityToggles project={project} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Membres ayant rejoint ce projet via le lien d'invitation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {project.members && project.members.length > 0 ? (
                      <div className="divide-y">
                        {project.members.map((m) => (
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
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" className="gap-2" onClick={() => copyInviteLink(project)}>
                    <Link2 className="h-3.5 w-3.5" />
                    Lien d'invitation
                  </Button>
                  {project.owner.id === user?.id && (
                    <Button size="sm" className="gap-2" onClick={() => copyAdminLink(project)}>
                      <UserPlus className="h-3.5 w-3.5" />
                      Ajouter Admin
                    </Button>
                  )}
                </div>
                {project.owner.id === user?.id && (
                  <div className="pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeletingProjectId(project.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer ce projet
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Aucun projet possédé — proposer la création */
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mon projet</h2>
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
                <DialogContent className="top-4 translate-y-0 sm:top-[50%] sm:-translate-y-1/2 sm:max-w-sm">
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

      <Separator />

      {/* Mon profil */}
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

      {/* Zone de danger */}
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
    </div>
  );
}
