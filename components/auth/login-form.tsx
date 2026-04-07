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
    <div className="w-full max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-none shadow-2xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="text-center space-y-2 p-8 pb-0">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-[2rem] shadow-2xl shadow-primary/20 mb-4 rotate-3 group transition-transform hover:rotate-0 duration-500 mx-auto">
            <GraduationCap className="w-10 h-10 text-primary-foreground -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          <CardTitle className="text-3xl font-bold font-heading">Gestion Scolaire</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Connectez-vous avec votre identifiant
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {loginMutation.isError && (
              <Alert variant="destructive" className="rounded-2xl border-none bg-destructive/10 text-destructive animate-in shake duration-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold">
                  {(loginMutation.error as any)?.response?.data?.detail || "Identifiant ou mot de passe incorrect"}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold ml-1">Identifiant</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ex: admin, teacher01..."
                className="h-12 bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl font-bold"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive font-bold ml-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold ml-1">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl font-bold"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive font-bold ml-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
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

            <div className="text-center pt-2">
              <Button
                variant="link"
                className="text-sm text-muted-foreground font-medium hover:text-primary transition-colors"
                type="button"
              >
                Mot de passe oublié ?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}