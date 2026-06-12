import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useProjectsQuery } from '@/hooks/useProjectsQuery';
import { usePronosticsQuery } from '@/hooks/usePronosticsQuery';
import { useCreatePronosticMutation } from '@/hooks/useCreatePronosticMutation';
import { useUpdatePronosticMutation } from '@/hooks/useUpdatePronosticMutation';
import { useDeletePronosticMutation } from '@/hooks/useDeletePronosticMutation';
import { useRevealResultMutation } from '@/hooks/useRevealResultMutation';
import { toast } from '@/hooks/use-toast';
import type { IPronostic, IRevealResultDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  Crown,
  Flower2,
  Lock,
  Plus,
  Ruler,
  Scale,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';

const MAX_SCORE = 110;

const pronosticSchema = z.object({
  authorName: z.string().min(2, 'Nom requis'),
  gender: z.enum(['boy', 'girl']),
  birthDate: z.string().min(1, 'Date requise'),
  weightGrams: z.coerce.number().min(500).max(6000),
  heightCm: z.coerce.number().min(30).max(70),
  firstName: z.string().min(1, 'Prénom requis'),
  message: z.string().optional(),
});

const revealSchema = z.object({
  gender: z.enum(['boy', 'girl']),
  birthDate: z.string().min(1, 'Date requise'),
  weightGrams: z.coerce.number().min(500).max(6000),
  heightCm: z.coerce.number().min(30).max(70),
  firstName: z.string().min(1, 'Prénom requis'),
});

type PronosticFormData = z.infer<typeof pronosticSchema>;
type RevealFormData = z.infer<typeof revealSchema>;

const genderLabels: Record<string, { label: string; class: string }> = {
  boy: { label: 'Garçon', class: 'bg-blue-100 text-blue-700' },
  girl: { label: 'Fille', class: 'bg-pink-100 text-pink-700' },
  surprise: { label: 'Surprise', class: 'bg-teal-100 text-teal-700' },
};

function ScoreBar({ score, max = MAX_SCORE }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Score</span>
        <span className="font-semibold text-foreground">
          {score} / {max} pts
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function PronosticsPage() {
  const user = useAuthStore((s) => s.user);
  const { currentProjectId } = useProjectStore();
  const { data: projects = [] } = useProjectsQuery();
  const currentProject = projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;
  const isProjectOwner = !!(user && currentProject && currentProject.owner.id === user.id);

  const { data: pronostics = [], isLoading } = usePronosticsQuery(currentProject?.id ?? null);
  const userHasPronostic = pronostics.some((p) => p.userId === user?.id);
  const createPronosticMutation = useCreatePronosticMutation(currentProject?.id ?? null);
  const updatePronosticMutation = useUpdatePronosticMutation(currentProject?.id ?? null);
  const deletePronosticMutation = useDeletePronosticMutation(currentProject?.id ?? null);
  const revealResultMutation = useRevealResultMutation(currentProject?.id ?? 0);

  const [openPronostic, setOpenPronostic] = useState(false);
  const [editingPronostic, setEditingPronostic] = useState<IPronostic | null>(null);
  const [openReveal, setOpenReveal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PronosticFormData>({
    resolver: zodResolver(pronosticSchema),
    defaultValues: { authorName: user?.name ?? '' },
  });

  const {
    register: revealRegister,
    handleSubmit: revealHandleSubmit,
    setValue: revealSetValue,
    formState: { errors: revealErrors, isSubmitting: revealSubmitting },
  } = useForm<RevealFormData>({ resolver: zodResolver(revealSchema) });

  const openEditDialog = (p: IPronostic) => {
    setEditingPronostic(p);
    reset({
      authorName: p.authorName,
      gender: p.gender,
      birthDate: new Date(p.birthDate).toISOString().slice(0, 10),
      weightGrams: p.weightGrams,
      heightCm: p.heightCm,
      firstName: p.firstName,
      message: p.message ?? '',
    });
    setOpenPronostic(true);
  };

  const closePronosticDialog = () => {
    setOpenPronostic(false);
    setEditingPronostic(null);
    reset({ authorName: user?.name ?? '' });
  };

  const onSubmitPronostic = async (data: PronosticFormData) => {
    if (!currentProject) return;
    try {
      if (editingPronostic) {
        await updatePronosticMutation.mutateAsync({ id: editingPronostic.id, ...data });
        toast({ title: 'Pronostic modifié !' });
      } else {
        await createPronosticMutation.mutateAsync({ ...data, projectId: currentProject.id });
        toast({ title: 'Pronostic soumis !', description: 'Bonne chance !' });
      }
      closePronosticDialog();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : "Erreur lors de l'envoi",
      });
    }
  };

  const onReveal = async (data: RevealFormData) => {
    if (!currentProject) return;
    try {
      const dto: IRevealResultDto = data;
      await revealResultMutation.mutateAsync(dto);
      toast({ title: 'Résultats révélés !', description: 'Les scores sont calculés.' });
      setOpenReveal(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de la révélation',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce pronostic ?')) return;
    try {
      await deletePronosticMutation.mutateAsync(id);
      toast({ title: 'Pronostic supprimé' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur lors de la suppression' });
    }
  };

  const birthResult = currentProject?.birthResult ?? null;
  const winner = currentProject?.winner ?? null;

  const sortedPronostics = [...pronostics].sort((a, b) => {
    if (birthResult) return (b.score ?? -1) - (a.score ?? -1);
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Flower2 className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Aucun projet sélectionné.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pronostics</h1>
          <p className="text-muted-foreground">
            {pronostics.length} pronostic{pronostics.length > 1 ? 's' : ''}{' '}
            {birthResult ? '— résultats révélés' : '— résultats à venir'}
          </p>
        </div>
        <div className="flex gap-2">
          {isProjectOwner && !birthResult && (
            <Dialog open={openReveal} onOpenChange={setOpenReveal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Révéler les résultats
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Saisir les vraies réponses</DialogTitle>
                </DialogHeader>
                <form onSubmit={revealHandleSubmit(onReveal)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sexe</Label>
                    <Select onValueChange={(v) => revealSetValue('gender', v as 'boy' | 'girl')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Garçon ou Fille ?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boy">Garçon</SelectItem>
                        <SelectItem value="girl">Fille</SelectItem>
                      </SelectContent>
                    </Select>
                    {revealErrors.gender && (
                      <p className="text-xs text-destructive">{revealErrors.gender.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input placeholder="Le vrai prénom" {...revealRegister('firstName')} />
                    {revealErrors.firstName && (
                      <p className="text-xs text-destructive">{revealErrors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance</Label>
                    <Input type="date" {...revealRegister('birthDate')} />
                    {revealErrors.birthDate && (
                      <p className="text-xs text-destructive">{revealErrors.birthDate.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Poids (g)</Label>
                      <Input type="number" placeholder="3200" {...revealRegister('weightGrams')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Taille (cm)</Label>
                      <Input type="number" placeholder="50" {...revealRegister('heightCm')} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={revealSubmitting}>
                    {revealSubmitting ? 'Calcul des scores...' : 'Révéler et calculer les scores'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={openPronostic} onOpenChange={(open) => { if (!open) closePronosticDialog(); else setOpenPronostic(true); }}>
              {!birthResult && !isProjectOwner && !userHasPronostic && (
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Mon pronostic
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent
                className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingPronostic ? 'Modifier mon pronostic' : 'Soumettre mon pronostic'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitPronostic)} className="space-y-4">
                  {currentProject.hint && (
                    <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <span className="font-semibold">Indice :</span> {currentProject.hint}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Sexe du bébé</Label>
                    <Select
                      value={watch('gender') || undefined}
                      onValueChange={(v) => setValue('gender', v as PronosticFormData['gender'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Votre pronostic..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boy">Garçon</SelectItem>
                        <SelectItem value="girl">Fille</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-xs text-destructive">{errors.gender.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom proposé</Label>
                    <Input placeholder="Ex: Emma, Lucas..." {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance</Label>
                    <Input type="date" {...register('birthDate')} />
                    {errors.birthDate && (
                      <p className="text-xs text-destructive">{errors.birthDate.message}</p>
                    )}
                    {currentProject.termDate && (
                      <p className="text-xs text-teal-700">
                        Date de terme : {new Date(currentProject.termDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Poids (grammes)</Label>
                      <Input type="number" placeholder="3200" {...register('weightGrams')} />
                      {errors.weightGrams && (
                        <p className="text-xs text-destructive">{errors.weightGrams.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Taille (cm)</Label>
                      <Input type="number" placeholder="50" {...register('heightCm')} />
                      {errors.heightCm && (
                        <p className="text-xs text-destructive">{errors.heightCm.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Message (optionnel)</Label>
                    <Textarea placeholder="Un petit mot pour les parents..." {...register('message')} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi...' : editingPronostic ? 'Enregistrer les modifications' : 'Soumettre mon pronostic'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {birthResult && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="mb-1 text-sm font-semibold text-green-800">
            Vraies réponses révélées par {currentProject.owner.name}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-green-700">
            <span>Sexe : <strong>{birthResult.gender === 'boy' ? 'Garçon' : 'Fille'}</strong></span>
            <span>Prénom : <strong>{birthResult.firstName}</strong></span>
            <span>Date : <strong>{new Date(birthResult.birthDate).toLocaleDateString('fr-FR')}</strong></span>
            <span>Poids : <strong>{(birthResult.weightGrams / 1000).toFixed(2)} kg</strong></span>
            <span>Taille : <strong>{birthResult.heightCm} cm</strong></span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : sortedPronostics.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Aucun pronostic pour l'instant. Soyez le premier !</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPronostics.map((p) => {
            const isWinner = winner?.id === p.id;
            const gender = genderLabels[p.gender] ?? genderLabels.surprise;
            return (
              <Card
                key={p.id}
                className={isWinner ? 'border-2 border-yellow-400 bg-yellow-50/50 shadow-md' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isWinner && <Crown className="h-5 w-5 shrink-0 text-yellow-500" />}
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <CardTitle className="text-base">{p.authorName}</CardTitle>
                    </div>
                    <Badge className={gender.class}>{gender.label}</Badge>
                  </div>
                  <CardDescription>
                    Prénom : <span className="font-medium text-foreground">{p.firstName}</span>
                  </CardDescription>
                  {isWinner && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-yellow-700">
                      <Trophy className="h-4 w-4" />
                      Gagnant !
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(p.birthDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5" />
                        <span>{(p.weightGrams / 1000).toFixed(2)} kg</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5" />
                        <span>{p.heightCm} cm</span>
                      </div>
                    </div>
                  </div>

                  {p.message && (
                    <p className="rounded-md bg-muted px-3 py-2 text-sm italic">
                      "{p.message}"
                    </p>
                  )}

                  {birthResult && p.score !== null && p.score !== undefined && (
                    <>
                      <Separator />
                      <ScoreBar score={p.score} />
                      {p.scoreDetails && (
                        <div className="grid grid-cols-5 gap-1 text-center text-xs">
                          {[
                            { label: 'Genre', val: p.scoreDetails.gender, max: 20 },
                            { label: 'Prénom', val: p.scoreDetails.firstName, max: 30 },
                            { label: 'Date', val: p.scoreDetails.birthDate, max: 30 },
                            { label: 'Poids', val: p.scoreDetails.weight, max: 20 },
                            { label: 'Taille', val: p.scoreDetails.height, max: 10 },
                          ].map(({ label, val, max }) => (
                            <div
                              key={label}
                              className={`rounded p-1 ${val === max ? 'bg-green-100 text-green-700' : val > 0 ? 'bg-blue-50 text-blue-700' : 'bg-muted text-muted-foreground'}`}
                            >
                              <div className="font-bold">{val}</div>
                              <div className="truncate opacity-70">{label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {!birthResult && p.userId === user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => openEditDialog(p)}
                    >
                      Modifier
                    </Button>
                  )}
                  {isProjectOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      Supprimer
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
