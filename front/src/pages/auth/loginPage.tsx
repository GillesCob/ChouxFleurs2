import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginMutation } from '@/hooks/useLoginMutation';
import { useJoinProjectMutation } from '@/hooks/useJoinProjectMutation';
import { useJoinAdminProjectMutation } from '@/hooks/useJoinAdminProjectMutation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const adminInviteToken = searchParams.get('admin-invite');
  const loginMutation = useLoginMutation();
  const joinProjectMutation = useJoinProjectMutation();
  const joinAdminProjectMutation = useJoinAdminProjectMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({ email: data.email, password: data.password });
      if (inviteToken) {
        try {
          await joinProjectMutation.mutateAsync(inviteToken);
        } catch {
          // déjà membre ou token invalide — on ignore
        }
      }
      if (adminInviteToken) {
        try {
          await joinAdminProjectMutation.mutateAsync(adminInviteToken);
        } catch {
          // déjà admin ou token invalide — on ignore
        }
        navigate('/admin');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: err instanceof Error ? err.message : 'Identifiants incorrects',
      });
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="flex min-h-full items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center pt-8 pb-4">
          <div className="flex justify-center mb-2">
            <img src="/Chouxfleur2noir.png" alt="ChouxFleurs" className="h-16 w-16 object-contain" />
          </div>
          <CardTitle className="text-2xl">ChouxFleurs</CardTitle>
          <CardDescription>
            {adminInviteToken
              ? 'Connectez-vous pour accepter le rôle admin'
              : inviteToken
              ? 'Connectez-vous pour rejoindre le projet'
              : 'Connectez-vous à votre espace'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="vous@exemple.fr" {...register('email')} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link
                to={adminInviteToken ? `/register?admin-invite=${adminInviteToken}` : inviteToken ? `/register?invite=${inviteToken}` : '/register'}
                className="text-primary hover:underline"
              >
                S'inscrire
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
