import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '@/hooks/useForgotPasswordMutation';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email: data.email });
      setIsSent(true);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Une erreur est survenue',
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
            <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
            <CardDescription>
              {isSent
                ? 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
                : 'Indiquez votre email pour recevoir un lien de réinitialisation'}
            </CardDescription>
          </CardHeader>
          {!isSent && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="text-base"
                    placeholder="vous@exemple.fr"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    Retour à la connexion
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
          {isSent && (
            <CardFooter className="flex flex-col gap-3">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Retour à la connexion
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
