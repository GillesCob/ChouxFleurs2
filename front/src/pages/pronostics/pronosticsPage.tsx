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
import { cn } from '@/lib/utils';
import {
  Calendar,
  Crown,
  Flower2,
  Lock,
  Pencil,
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

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function medianDate(isoStrings: string[]): string {
  if (isoStrings.length === 0) return '';
  const timestamps = isoStrings.map((s) => new Date(s).getTime());
  const med = median(timestamps);
  return new Date(med).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function GenderPieChart({ boys, girls }: { boys: number; girls: number }) {
  const total = boys + girls;
  if (total === 0) return null;
  const boyPct = Math.round((boys / total) * 100);
  const girlPct = 100 - boyPct;
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="h-32 w-32 rounded-full"
        style={{
          background: `conic-gradient(#93c5fd 0% ${boyPct}%, #f9a8d4 ${boyPct}% 100%)`,
        }}
      />
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-300" />
          <span className="font-medium text-blue-700">Garçon</span>
          <span className="text-muted-foreground">{boyPct}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-pink-300" />
          <span className="font-medium text-pink-700">Fille</span>
          <span className="text-muted-foreground">{girlPct}%</span>
        </div>
      </div>
    </div>
  );
}

function TendanceTab({ pronostics }: { pronostics: IPronostic[] }) {
  const boys = pronostics.filter((p) => p.gender === 'boy').length;
  const girls = pronostics.filter((p) => p.gender === 'girl').length;

  const medianWeight = median(pronostics.map((p) => p.weightGrams));
  const medianHeight = median(pronostics.map((p) => p.heightCm));
  const medianBirthDate = medianDate(pronostics.map((p) => p.birthDate));

  const nameCounts: Record<string, number> = {};
  for (const p of pronostics) {
    const name = p.firstName.trim().toLowerCase();
    nameCounts[name] = (nameCounts[name] ?? 0) + 1;
  }
  const popularNames = Object.entries(nameCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      display: pronostics.find((p) => p.firstName.trim().toLowerCase() === name)!.firstName,
      count,
    }));

  if (pronostics.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Pas encore assez de pronostics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sexe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sexe du bébé</CardTitle>
          <CardDescription>
            {boys} garçon{boys > 1 ? 's' : ''} · {girls} fille{girls > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-2">
          <GenderPieChart boys={boys} girls={girls} />
        </CardContent>
      </Card>

      {/* Médianes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valeurs médianes</CardTitle>
          <CardDescription>Basées sur {pronostics.length} pronostic{pronostics.length > 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <Calendar className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-semibold tabular-nums">{medianBirthDate}</p>
            </div>
            <div className="space-y-1">
              <Scale className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-semibold tabular-nums">{(medianWeight / 1000).toFixed(2)} kg</p>
            </div>
            <div className="space-y-1">
              <Ruler className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-semibold tabular-nums">{medianHeight} cm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prénoms populaires */}
      {popularNames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prénoms populaires</CardTitle>
            <CardDescription>Proposés par au moins 2 participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularNames.map(({ display, count }) => (
                <div key={display} className="flex items-center justify-between">
                  <span className="font-medium">{display}</span>
                  <Badge variant="secondary">{count} vote{count > 1 ? 's' : ''}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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

type ScoreField = 'gender' | 'firstName' | 'birthDate' | 'weight' | 'height';

const scoreScales: Record<ScoreField, { label: string; max: number; rows: { pts: number; condition: string }[] }> = {
  gender: {
    label: 'Genre',
    max: 20,
    rows: [
      { pts: 20, condition: 'Bonne réponse' },
      { pts: 0, condition: 'Mauvaise réponse' },
    ],
  },
  firstName: {
    label: 'Prénom',
    max: 30,
    rows: [
      { pts: 30, condition: 'Prénom exact' },
      { pts: 0, condition: 'Prénom différent' },
    ],
  },
  birthDate: {
    label: 'Date',
    max: 30,
    rows: [
      { pts: 30, condition: 'Date exacte' },
      { pts: 20, condition: 'Écart ≤ 1 jour' },
      { pts: 10, condition: 'Écart ≤ 3 jours' },
      { pts: 5, condition: 'Écart ≤ 7 jours' },
      { pts: 0, condition: 'Écart > 7 jours' },
    ],
  },
  weight: {
    label: 'Poids',
    max: 20,
    rows: [
      { pts: 20, condition: 'Écart ≤ 50 g' },
      { pts: 15, condition: 'Écart ≤ 200 g' },
      { pts: 10, condition: 'Écart ≤ 500 g' },
      { pts: 5, condition: 'Écart ≤ 1 000 g' },
      { pts: 0, condition: 'Écart > 1 000 g' },
    ],
  },
  height: {
    label: 'Taille',
    max: 10,
    rows: [
      { pts: 10, condition: 'Taille exacte' },
      { pts: 7, condition: 'Écart ≤ 1 cm' },
      { pts: 5, condition: 'Écart ≤ 2 cm' },
      { pts: 2, condition: 'Écart ≤ 3 cm' },
      { pts: 0, condition: 'Écart > 3 cm' },
    ],
  },
};

function getPronosticValueForField(p: IPronostic, field: ScoreField): string {
  if (field === 'gender') return p.gender === 'boy' ? 'Garçon' : p.gender === 'girl' ? 'Fille' : 'Surprise';
  if (field === 'firstName') return p.firstName;
  if (field === 'birthDate') return new Date(p.birthDate).toLocaleDateString('fr-FR');
  if (field === 'weight') return `${(p.weightGrams / 1000).toFixed(2)} kg`;
  return `${p.heightCm} cm`;
}

function getResultValueForField(
  result: { gender: string; firstName: string; birthDate: string; weightGrams: number; heightCm: number },
  field: ScoreField,
): string {
  if (field === 'gender') return result.gender === 'boy' ? 'Garçon' : 'Fille';
  if (field === 'firstName') return result.firstName;
  if (field === 'birthDate') return new Date(result.birthDate).toLocaleDateString('fr-FR');
  if (field === 'weight') return `${(result.weightGrams / 1000).toFixed(2)} kg`;
  return `${result.heightCm} cm`;
}

interface IScoreDetailPopupProps {
  pronostic: IPronostic;
  field: ScoreField;
  birthResult: { gender: string; firstName: string; birthDate: string; weightGrams: number; heightCm: number };
  onClose: () => void;
}

function ScoreDetailPopup({ pronostic, field, birthResult, onClose }: IScoreDetailPopupProps) {
  const sd = pronostic.scoreDetails;
  if (!sd) return null;
  const obtained =
    field === 'gender' ? sd.gender
    : field === 'firstName' ? sd.firstName
    : field === 'birthDate' ? sd.birthDate
    : field === 'weight' ? sd.weight
    : sd.height;
  const scale = scoreScales[field];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>
            {scale.label} — {obtained} / {scale.max} pts
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-muted p-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pronostic</span>
            <span className="font-medium">{getPronosticValueForField(pronostic, field)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bonne réponse</span>
            <span className="font-medium">{getResultValueForField(birthResult, field)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Points obtenus</span>
            <span>{obtained} / {scale.max}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Barème</p>
          {scale.rows.map(({ pts, condition }, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-center justify-between rounded px-2 py-1 text-sm',
                pts === obtained
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <span>{condition}</span>
              <span className="font-semibold tabular-nums">{pts} pts</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PronosticsPage() {
  const user = useAuthStore((s) => s.user);
  const { currentProjectId } = useProjectStore();
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const currentProject = projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;
  const isProjectOwner = !!(
    user &&
    currentProject &&
    (currentProject.owner.id === user.id ||
      currentProject.members?.some((m) => m.user.id === user.id && m.isAdmin))
  );

  const { data: pronostics = [], isPending: pronosticsLoading } = usePronosticsQuery(currentProject?.id ?? null);
  const isLoading = projectsLoading || pronosticsLoading;
  const userHasPronostic = pronostics.some((p) => p.userId === user?.id);
  const createPronosticMutation = useCreatePronosticMutation(currentProject?.id ?? null);
  const updatePronosticMutation = useUpdatePronosticMutation(currentProject?.id ?? null);
  const deletePronosticMutation = useDeletePronosticMutation(currentProject?.id ?? null);
  const revealResultMutation = useRevealResultMutation(currentProject?.id ?? 0);

  const [openPronostic, setOpenPronostic] = useState(false);
  const [editingPronostic, setEditingPronostic] = useState<IPronostic | null>(null);
  const [openReveal, setOpenReveal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tendance' | 'pronos'>('tendance');
  const [scorePopup, setScorePopup] = useState<{ pronostic: IPronostic; field: ScoreField } | null>(null);

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
    reset: revealReset,
    watch: revealWatch,
    formState: { errors: revealErrors, isSubmitting: revealSubmitting },
  } = useForm<RevealFormData>({ resolver: zodResolver(revealSchema) });

  const openEditDialog = (p: IPronostic) => {
    setEditingPronostic(p);
    reset({
      authorName: p.authorName,
      gender: p.gender as 'boy' | 'girl',
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
      toast({ title: currentProject?.birthResult ? 'Résultats modifiés !' : 'Résultats révélés !', description: 'Les scores sont calculés.' });
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

  const showTabs = userHasPronostic || isProjectOwner;

  const openEditReveal = () => {
    if (birthResult) {
      revealReset({
        gender: birthResult.gender as 'boy' | 'girl',
        firstName: birthResult.firstName,
        birthDate: new Date(birthResult.birthDate).toISOString().slice(0, 10),
        weightGrams: birthResult.weightGrams,
        heightCm: birthResult.heightCm,
      });
    }
    setOpenReveal(true);
  };

  if (projectsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Flower2 className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Aucun projet sélectionné.</p>
      </div>
    );
  }

  if (!isProjectOwner && !currentProject.pronosticsEnabled) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">La section pronostics est désactivée par l'administrateur.</p>
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
            <Button variant="outline" className="gap-2" onClick={() => setOpenReveal(true)}>
              <Lock className="h-4 w-4" />
              Révéler les résultats
            </Button>
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
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-green-800">Bonnes réponses</p>
            {isProjectOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-green-700 hover:bg-green-100 hover:text-green-900"
                onClick={openEditReveal}
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </Button>
            )}
          </div>
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
      ) : !showTabs ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Soumettez votre pronostic pour voir ceux des autres !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Onglets */}
          <div className="flex border-b">
            {(['tendance', 'pronos'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab === 'tendance' ? 'La tendance' : 'Les pronos'}
              </button>
            ))}
          </div>

          {activeTab === 'tendance' ? (
            <TendanceTab pronostics={sortedPronostics} />
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
                                { label: 'Genre', field: 'gender', val: p.scoreDetails.gender, max: 20 },
                                { label: 'Prénom', field: 'firstName', val: p.scoreDetails.firstName, max: 30 },
                                { label: 'Date', field: 'birthDate', val: p.scoreDetails.birthDate, max: 30 },
                                { label: 'Poids', field: 'weight', val: p.scoreDetails.weight, max: 20 },
                                { label: 'Taille', field: 'height', val: p.scoreDetails.height, max: 10 },
                              ].map(({ label, field, val, max }) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => setScorePopup({ pronostic: p, field: field as ScoreField })}
                                  className={cn(
                                    'w-full cursor-pointer rounded p-1 transition-opacity hover:opacity-80',
                                    val === max ? 'bg-green-100 text-green-700' : val > 0 ? 'bg-blue-50 text-blue-700' : 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  <div className="font-bold">{val}</div>
                                  <div className="truncate opacity-70">{label}</div>
                                </button>
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
      )}

      {scorePopup && birthResult && (
        <ScoreDetailPopup
          pronostic={scorePopup.pronostic}
          field={scorePopup.field}
          birthResult={birthResult}
          onClose={() => setScorePopup(null)}
        />
      )}

      {isProjectOwner && (
        <Dialog open={openReveal} onOpenChange={setOpenReveal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {birthResult ? 'Modifier les vraies réponses' : 'Saisir les vraies réponses'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={revealHandleSubmit(onReveal)} className="space-y-4">
              <div className="space-y-2">
                <Label>Sexe</Label>
                <Select
                  value={revealWatch('gender') || undefined}
                  onValueChange={(v) => revealSetValue('gender', v as 'boy' | 'girl')}
                >
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
                {revealSubmitting
                  ? 'Calcul des scores...'
                  : birthResult
                    ? 'Enregistrer et recalculer les scores'
                    : 'Révéler et calculer les scores'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
