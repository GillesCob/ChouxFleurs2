import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useInviteInfoQuery } from '@/hooks/useInviteInfoQuery';
import { useJoinProjectMutation } from '@/hooks/useJoinProjectMutation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Baby, LogIn, UserPlus } from 'lucide-react';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const joinProjectMutation = useJoinProjectMutation();

  const { data: info, isLoading, isError } = useInviteInfoQuery(token);

  useEffect(() => {
    if (isError) {
      toast({ variant: 'destructive', title: 'Lien invalide ou expiré' });
      navigate('/login');
    }
  }, [isError, navigate]);

  useEffect(() => {
    if (user && info) {
      handleJoin();
    }
  }, [user, info]);

  const handleJoin = async () => {
    if (!token) return;
    try {
      await joinProjectMutation.mutateAsync(token);
      toast({ title: 'Projet rejoint !', description: `Bienvenue dans "${info?.name}"` });
      navigate('/dashboard');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de rejoindre le projet',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Baby className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Vous êtes invité !</CardTitle>
          <CardDescription className="text-base">
            <span className="font-medium text-foreground">{info.owner.name}</span>{' '}
            vous invite à rejoindre le projet
          </CardDescription>
          <div className="rounded-lg bg-primary/5 px-4 py-3">
            <p className="text-xl font-semibold text-primary">{info.name}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {user ? (
            <Button
              className="w-full"
              onClick={handleJoin}
              disabled={joinProjectMutation.isPending}
            >
              {joinProjectMutation.isPending ? 'Rejoindre en cours...' : 'Rejoindre le projet'}
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Créez un compte ou connectez-vous pour participer.
              </p>
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" asChild>
                  <Link to={`/register?invite=${token}`}>
                    <UserPlus className="h-4 w-4" />
                    S'inscrire
                  </Link>
                </Button>
                <Button className="flex-1 gap-2" variant="outline" asChild>
                  <Link to={`/login?invite=${token}`}>
                    <LogIn className="h-4 w-4" />
                    Se connecter
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
