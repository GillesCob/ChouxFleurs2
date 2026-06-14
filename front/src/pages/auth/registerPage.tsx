import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useRegisterMutation } from '@/hooks/useRegisterMutation';
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

const buildSchema = (hasInviteToken: boolean) =>
  z
    .object({
      name: z.string().min(2, 'Nom trop court'),
      email: z.string().email('Email invalide'),
      projectName: hasInviteToken
        ? z.string().optional()
        : z.string().min(2, 'Nom du projet requis (min. 2 caractères)'),
      password: z.string().min(6, 'Au moins 6 caractères'),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    });

type RegisterFormData = {
  name: string;
  email: string;
  projectName?: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') ?? undefined;
  const adminInviteToken = searchParams.get('admin-invite') ?? undefined;
  const queryClient = useQueryClient();
  const registerMutation = useRegisterMutation();
  const joinAdminProjectMutation = useJoinAdminProjectMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(buildSchema(!!(inviteToken ?? adminInviteToken))),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        projectName: data.projectName,
        inviteToken,
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (adminInviteToken) {
        try {
          await joinAdminProjectMutation.mutateAsync(adminInviteToken);
        } catch {
          // token invalide — on ignore
        }
        navigate('/admin');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: "Erreur d'inscription",
        description: err instanceof Error ? err.message : 'Une erreur est survenue',
      });
    }
  };

  return (
    <div className='fixed inset-0 overflow-y-auto bg-gradient-to-br from-teal-50 to-cyan-50'>
      <div className='flex min-h-full items-center justify-center px-4 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-2 text-center pt-8 pb-4'>
          <div className='flex justify-center mb-2'>
            <img src='/Chouxfleur2noir.png' alt='ChouxFleurs' className='h-16 w-16 object-contain' />
          </div>
          <CardTitle className='text-2xl'>
            {adminInviteToken ? 'Devenir Admin' : inviteToken ? 'Rejoindre un projet' : 'Créer mon espace'}
          </CardTitle>
          <CardDescription>
            {adminInviteToken
              ? 'Créez votre compte pour accepter le rôle admin'
              : inviteToken
              ? 'Créez votre compte pour accéder au projet'
              : 'Inscrivez-vous et créez votre projet naissance'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Votre prénom / nom</Label>
              <Input id='name' placeholder='Marie Dupont' {...register('name')} />
              {errors.name && (
                <p className='text-xs text-destructive'>{errors.name.message}</p>
              )}
            </div>

            {!inviteToken && !adminInviteToken && (
              <div className='space-y-2'>
                <Label htmlFor='projectName'>Nom de votre projet</Label>
                <Input
                  id='projectName'
                  placeholder='Bébé Dupont 2025'
                  {...register('projectName')}
                />
                <p className='text-xs text-muted-foreground'>
                  Ce nom apparaîtra sur vos invitations.
                </p>
                {errors.projectName && (
                  <p className='text-xs text-destructive'>
                    {errors.projectName.message}
                  </p>
                )}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='vous@exemple.fr'
                {...register('email')}
              />
              {errors.email && (
                <p className='text-xs text-destructive'>{errors.email.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Mot de passe</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                {...register('password')}
              />
              {errors.password && (
                <p className='text-xs text-destructive'>
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirmer le mot de passe</Label>
              <Input
                id='confirmPassword'
                type='password'
                placeholder='••••••••'
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className='text-xs text-destructive'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-3'>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting
                ? 'Création...'
                : adminInviteToken
                  ? 'Créer mon compte et devenir Admin'
                  : inviteToken
                  ? 'Créer mon compte et rejoindre'
                  : 'Créer mon espace'}
            </Button>
            <p className='text-sm text-muted-foreground'>
              Déjà un compte ?{' '}
              <Link
                to={adminInviteToken ? `/login?admin-invite=${adminInviteToken}` : inviteToken ? `/login?invite=${inviteToken}` : '/login'}
                className='text-primary hover:underline'
              >
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
