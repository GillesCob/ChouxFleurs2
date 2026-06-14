import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useProjectsQuery } from '@/hooks/useProjectsQuery';
import { useCreateProjectMutation } from '@/hooks/useCreateProjectMutation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Gift, Link2, Loader2, Plus, Sparkles, Trophy, Users } from 'lucide-react';

const projectNameSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
});
type ProjectNameForm = z.infer<typeof projectNameSchema>;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { currentProjectId } = useProjectStore();
  const { data: projects = [], isLoading } = useProjectsQuery();
  const createProjectMutation = useCreateProjectMutation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;
  const isProjectOwner = !!(user && currentProject && currentProject.owner.id === user.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectNameForm>({ resolver: zodResolver(projectNameSchema) });

  const inviteUrl = currentProject ? `${window.location.origin}/invite/${currentProject.inviteToken}` : null;

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({ title: 'Lien copié !', description: 'Partagez-le avec vos proches.' });
    setTimeout(() => setCopied(false), 2500);
  };

  const onCreateProject = async (data: ProjectNameForm) => {
    try {
      const project = await createProjectMutation.mutateAsync(data.name);
      toast({ title: 'Projet créé !', description: `'${project.name}' est prêt.` });
      reset();
      setOpenCreate(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de créer le projet',
      });
    }
  };

  const winner = currentProject?.winner ?? null;
  const hasResult = !!currentProject?.birthResult;

  const showPronostics = !currentProject || (currentProject.pronosticsEnabled ?? true);
  const showBirthList = !currentProject || (currentProject.birthListEnabled ?? true);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
      <DialogContent className='top-4 translate-y-0 sm:top-[50%] sm:-translate-y-1/2 sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet bébé</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onCreateProject)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='projectName'>Nom du projet</Label>
            <Input id='projectName' placeholder='Bébé Martin 2026' {...register('name')} />
            {errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
          </div>
          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le projet'}
          </Button>
        </form>
      </DialogContent>

    <div className='space-y-8'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Bonjour, {user?.name} !</h1>
        </div>

        {/* Desktop — bouton en haut à droite */}
        <DialogTrigger asChild>
          <Button variant='outline' className='hidden gap-2 md:flex'>
            <Plus className='h-4 w-4' />
            Nouveau projet
          </Button>
        </DialogTrigger>
      </div>

      {/* Bannière gagnant */}
      {hasResult && winner && (
        <div className='flex items-start gap-4 rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 p-6'>
          <div className='rounded-full bg-yellow-400 p-3'>
            <Trophy className='h-6 w-6 text-yellow-900' />
          </div>
          <div className='flex-1 space-y-1'>
            <p className='text-sm font-medium text-yellow-700'>Résultats révélés !</p>
            <p className='text-xl font-bold text-yellow-900'>
              {winner.authorName} remporte le grand prix avec {winner.score} points !
            </p>
            <p className='text-sm text-yellow-800'>
              Prénom pronostiqué : <strong>{winner.firstName}</strong>
            </p>
            {winner.scoreDetails && (
              <div className='mt-2 flex flex-wrap gap-2'>
                {[
                  { label: 'Genre', val: winner.scoreDetails.gender },
                  { label: 'Prénom', val: winner.scoreDetails.firstName },
                  { label: 'Date', val: winner.scoreDetails.birthDate },
                  { label: 'Poids', val: winner.scoreDetails.weight },
                  { label: 'Taille', val: winner.scoreDetails.height },
                ].map(({ label, val }) => (
                  <Badge key={label} className='bg-yellow-200 text-yellow-800'>
                    {label} : {val} pts
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      {/* <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 p-8 text-white'>
        <div className='relative z-10 space-y-2'>
          <div className='flex items-center gap-2 text-white/80'>
            <Flower2 className='h-5 w-5' />
            <span className='text-sm font-medium'>Un bébé arrive !</span>
          </div>
          <h2 className='text-2xl font-bold'>Faites vos pronostics</h2>
          <p className='text-white/90'>Devinez le prénom, le sexe, le poids et la date de naissance.</p>
        </div>
        <Flower2 className='absolute -right-8 -top-8 h-48 w-48 rotate-12 text-white/10' />
      </div> */}

      <Separator />

      {/* Navigation rapide */}
      {(showPronostics || showBirthList) && (
        <div className={`grid gap-4 ${showPronostics && showBirthList ? 'sm:grid-cols-2' : ''}`}>
          {showPronostics && (
            <Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => navigate('/pronostics')}>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <div className='rounded-lg bg-teal-100 p-2'>
                    <Sparkles className='h-6 w-6 text-teal-600' />
                  </div>
                  <div>
                    <CardTitle>Pronostics</CardTitle>
                    <CardDescription>Tentez votre chance !</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Proposez vos pronostics sur le prénom, le sexe, la date, le poids et la taille du bébé.
                </p>
                <Button className='mt-4 w-full' variant='outline'>
                  Voir les pronostics
                </Button>
              </CardContent>
            </Card>
          )}

          {showBirthList && (
            <Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => navigate('/liste-naissance')}>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <div className='rounded-lg bg-amber-100 p-2'>
                    <Gift className='h-6 w-6 text-amber-600' />
                  </div>
                  <div>
                    <CardTitle>Liste de naissance</CardTitle>
                    <CardDescription>Offrez avec le cœur</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Découvrez la liste de cadeaux et réservez un article pour faire plaisir aux heureux parents.
                </p>
                <Button className='mt-4 w-full' variant='outline'>
                  Voir la liste
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Lien d'invitation — propriétaire uniquement */}
      {currentProject && isProjectOwner && (
        <div className='space-y-3 rounded-xl border p-5'>
          <div className='flex items-center gap-2'>
            <Link2 className='h-4 w-4 text-primary' />
            <h2 className='font-semibold'>Inviter des amis</h2>
          </div>
          <div className='flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3'>
            <code className='flex-1 select-all truncate text-sm text-muted-foreground'>{inviteUrl}</code>
            <Button size='sm' onClick={copyInviteLink} className='shrink-0 gap-2'>
              {copied ? (
                <>
                  <Check className='h-3.5 w-3.5' />
                  Copié !
                </>
              ) : (
                <>
                  <Link2 className='h-3.5 w-3.5' />
                  Copier le lien
                </>
              )}
            </Button>
          </div>
          <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <Users className='h-3.5 w-3.5' />
              <span>
                {currentProject.memberCount} participant
                {currentProject.memberCount > 1 ? 's' : ''}
              </span>
            </div>
            <Badge variant='secondary'>Admin du projet</Badge>
          </div>
        </div>
      )}

      {/* Mobile — bouton en bas */}
      <DialogTrigger asChild>
        <Button variant='outline' className='flex w-full gap-2 md:hidden'>
          <Plus className='h-4 w-4' />
          Nouveau projet
        </Button>
      </DialogTrigger>
    </div>
    </Dialog>
  );
}
