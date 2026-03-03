// src/components/auth/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, GraduationCap, Loader2 } from "lucide-react";

import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.Schema";
import { useLogin } from "@/hooks/use-login";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
          <GraduationCap className="w-10 h-10 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Gestion Scolaire</CardTitle>
        <CardDescription>
          Connectez-vous avec votre identifiant</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loginMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(loginMutation.error as Error)?.message}
              </AlertDescription>
            </Alert>
          )}

          {/* <Alert>
            <AlertDescription className="text-xs">
              <strong>Comptes de démo :</strong>
              <br />
              Admin → admin@school.fr / admin123
              <br />
              Prof → teacher@school.fr / teacher123
              <br />
              Chauffeur → driver@school.fr / driver123
              <br />
              Parent → parent@school.fr / parent123
            </AlertDescription>
          </Alert> */}

          <div className="space-y-2">
  <Label htmlFor="username">Identifiant</Label>
  <Input
    id="username"
    type="text"
    placeholder="admin, teacher01, parent123..."
    autoComplete="username"
    {...register("username")}
  />
  {errors.username && (
    <p className="text-sm text-destructive">{errors.username.message}</p>
  )}
</div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>

          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground" type="button">
              Forgot password?
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}