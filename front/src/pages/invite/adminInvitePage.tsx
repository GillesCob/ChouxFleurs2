import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAdminInviteInfoQuery } from '@/hooks/useAdminInviteInfoQuery';
import { useJoinAdminProjectMutation } from '@/hooks/useJoinAdminProjectMutation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn, ShieldCheck, UserPlus } from 'lucide-react';

export default function AdminInvitePage() {
  const { token } = useParams<{ token: string }>();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const joinAdminProjectMutation = useJoinAdminProjectMutation();

  const { data: info, isLoading, isError } = useAdminInviteInfoQuery(token);

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
      await joinAdminProjectMutation.mutateAsync(token);
      toast({ title: 'Accès admin accordé !', description: `Vous gérez maintenant le projet "${info?.name}".` });
      navigate('/admin');
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
            <img src="/Chouxfleur2noir.png" alt="ChouxFleurs" className="h-16 w-16 object-contain" />
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-teal-100 p-3">
              <ShieldCheck className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Invitation Admin</CardTitle>
          <CardDescription className="text-base">
            <span className="font-medium text-foreground">{info.owner.name}</span>{' '}
            vous invite à co-administrer le projet
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
              disabled={joinAdminProjectMutation.isPending}
            >
              {joinAdminProjectMutation.isPending ? 'Activation en cours...' : 'Accepter le rôle Admin'}
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Créez un compte ou connectez-vous pour accepter ce rôle.
              </p>
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" asChild>
                  <Link to={`/register?admin-invite=${token}`}>
                    <UserPlus className="h-4 w-4" />
                    S'inscrire
                  </Link>
                </Button>
                <Button className="flex-1 gap-2" variant="outline" asChild>
                  <Link to={`/login?admin-invite=${token}`}>
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
