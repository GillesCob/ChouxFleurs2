import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { BirthListItem, Contribution, CreateBirthListItemDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Flower2,
  Gift,
  HandCoins,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getItemStats(item: BirthListItem) {
  const price = Number(item.price);
  const totalContributed = item.contributions.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );
  const remaining = Math.max(price - totalContributed, 0);
  const pct = Math.min((totalContributed / price) * 100, 100);
  const isFullyFunded = remaining === 0;
  return { price, totalContributed, remaining, pct, isFullyFunded };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FundingBar({ pct, isFullyFunded }: { pct: number; isFullyFunded: boolean }) {
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isFullyFunded ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(pct)} % financé</span>
      </div>
    </div>
  );
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  price: z.coerce.number().min(0.01, "Prix invalide"),
  imageUrl: z.string().url("URL d'image invalide"),
  productUrl: z.string().url("URL produit invalide"),
  description: z.string().optional(),
});

const buildContribSchema = (max: number) =>
  z.object({
    participantName: z.string().min(1, "Nom requis"),
    amount: z.coerce
      .number()
      .min(0.01, "Montant invalide")
      .max(max, `Maximum ${max.toFixed(2)} €`),
  });

type ItemFormData = z.infer<typeof itemSchema>;
type ContribFormData = { participantName: string; amount: number };

// ─── Contribution dialog ──────────────────────────────────────────────────────

function ContributeDialog({
  item,
  userName,
  onSuccess,
}: {
  item: BirthListItem;
  userName: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { price, totalContributed, remaining, isFullyFunded } = getItemStats(item);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContribFormData>({
    resolver: zodResolver(buildContribSchema(remaining)),
    defaultValues: { participantName: userName, amount: undefined },
  });

  const onSubmit = async (data: ContribFormData) => {
    try {
      await api.post(`/birth-list/${item.id}/contributions`, {
        amount: data.amount,
        participantName: data.participantName,
      });
      toast({
        title: "Participation enregistrée !",
        description: `${data.amount.toFixed(2)} € pour ${item.name}`,
      });
      reset({ participantName: userName, amount: undefined });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de la participation",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 gap-1.5" disabled={isFullyFunded}>
          <HandCoins className="h-3.5 w-3.5" />
          {isFullyFunded ? "Financé" : "Participer"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Participer à « {item.name} »</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prix total</span>
            <span className="font-medium">{price.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Déjà financé</span>
            <span className="font-medium text-green-600">{totalContributed.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Reste à financer</span>
            <span className="text-primary">{remaining.toFixed(2)} €</span>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Votre nom</Label>
            <Input {...register("participantName")} />
            {errors.participantName && (
              <p className="text-xs text-destructive">{errors.participantName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Montant de votre participation (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              placeholder={`max ${remaining.toFixed(2)} €`}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Confirmer ma participation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Contribution list ────────────────────────────────────────────────────────

function ContributionList({
  contributions,
  currentUserId,
  isProjectOwner,
  onRemove,
}: {
  contributions: Contribution[];
  currentUserId: number;
  isProjectOwner: boolean;
  onRemove: (id: number) => void;
}) {
  if (contributions.length === 0) return null;
  return (
    <div className="space-y-1">
      {contributions.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs"
        >
          <span className="font-medium">{c.participantName}</span>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-semibold">
              {Number(c.amount).toFixed(2)} €
            </span>
            {(isProjectOwner || c.userId === currentUserId) && (
              <button
                onClick={() => onRemove(c.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Supprimer cette participation"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ListeNaissancePage() {
  const { currentProject, isProjectOwner, isLoading: projectLoading } = useProject();
  const { user } = useAuth();
  const [items, setItems] = useState<BirthListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({ resolver: zodResolver(itemSchema) });

  const fetchItems = async () => {
    if (!currentProject) return;
    setIsLoading(true);
    try {
      const data = await api.get<BirthListItem[]>(
        `/birth-list?projectId=${currentProject.id}`
      );
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: "Impossible de charger la liste" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentProject?.id]);

  const onSubmitItem = async (data: ItemFormData) => {
    if (!currentProject) return;
    try {
      const dto: CreateBirthListItemDto = { ...data, projectId: currentProject.id };
      await api.post<BirthListItem>("/birth-list", dto);
      toast({ title: "Article ajouté !" });
      reset();
      setOpen(false);
      fetchItems();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de l'ajout",
      });
    }
  };

  const handleRemoveContribution = async (contributionId: number) => {
    if (!confirm("Supprimer cette participation ?")) return;
    try {
      await api.delete(`/birth-list/contributions/${contributionId}`);
      toast({ title: "Participation supprimée" });
      fetchItems();
    } catch {
      toast({ variant: "destructive", title: "Erreur lors de la suppression" });
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await api.delete(`/birth-list/${id}`);
      toast({ title: "Article supprimé" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast({ variant: "destructive", title: "Erreur lors de la suppression" });
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Flower2 className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Aucun projet trouvé.</p>
      </div>
    );
  }

  const fullyFunded = items.filter((i) => getItemStats(i).isFullyFunded).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Liste de naissance</h1>
          <p className="text-muted-foreground">
            {items.length} article{items.length > 1 ? "s" : ""} —{" "}
            {fullyFunded} entièrement financé{fullyFunded > 1 ? "s" : ""}
            {isProjectOwner && (
              <Badge variant="secondary" className="ml-3">
                Admin
              </Badge>
            )}
          </p>
        </div>

        {isProjectOwner && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un article
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Ajouter un article à la liste</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmitItem)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du produit</Label>
                  <Input placeholder="Poussette 3-en-1" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Prix total (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="299.99"
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>URL de l'image</Label>
                  <Input type="url" placeholder="https://..." {...register("imageUrl")} />
                  {errors.imageUrl && (
                    <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Lien vers le produit</Label>
                  <Input type="url" placeholder="https://..." {...register("productUrl")} />
                  {errors.productUrl && (
                    <p className="text-xs text-destructive">{errors.productUrl.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Description (optionnelle)</Label>
                  <Textarea
                    placeholder="Couleur, taille, référence..."
                    {...register("description")}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Ajout en cours..." : "Ajouter à la liste"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Gift className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {isProjectOwner
              ? "La liste est vide. Cliquez sur « Ajouter un article » pour commencer !"
              : "La liste est vide pour l'instant."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const { price, totalContributed, remaining, pct, isFullyFunded } =
              getItemStats(item);
            return (
              <Card key={item.id} className="flex flex-col">
                {/* Image */}
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-44 w-full rounded-t-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x200?text=Image";
                    }}
                  />
                  {isFullyFunded && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-green-900/50">
                      <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                        Entièrement financé !
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <p className="text-lg font-bold text-primary">{price.toFixed(2)} €</p>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pb-3">
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}

                  {/* Barre de financement */}
                  <FundingBar pct={pct} isFullyFunded={isFullyFunded} />
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600 font-medium">
                      {totalContributed.toFixed(2)} € financés
                    </span>
                    {!isFullyFunded && (
                      <span className="text-muted-foreground">
                        {remaining.toFixed(2)} € restants
                      </span>
                    )}
                  </div>

                  {/* Liste des participants */}
                  <ContributionList
                    contributions={item.contributions}
                    currentUserId={user?.id ?? -1}
                    isProjectOwner={isProjectOwner}
                    onRemove={handleRemoveContribution}
                  />
                </CardContent>

                <CardFooter className="flex gap-2 pt-0">
                  <ContributeDialog
                    item={item}
                    userName={user?.name ?? ""}
                    onSuccess={fetchItems}
                  />
                  <Button size="sm" variant="outline" asChild>
                    <a href={item.productUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  {isProjectOwner && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
