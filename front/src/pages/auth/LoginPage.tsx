import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flower2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { refreshProjects } = useProject();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      if (inviteToken) {
        try {
          await api.post(`/projects/join/${inviteToken}`, {});
        } catch {
          // already member or invalid — silently ignore
        }
        await refreshProjects();
      }
      navigate("/dashboard");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description:
          err instanceof Error ? err.message : "Identifiants incorrects",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <Flower2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">ChouxFleurs</CardTitle>
          <CardDescription>
            {inviteToken
              ? "Connectez-vous pour rejoindre le projet"
              : "Connectez-vous à votre espace"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.fr"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link
                to={inviteToken ? `/register?invite=${inviteToken}` : "/register"}
                className="text-primary hover:underline"
              >
                S'inscrire
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
