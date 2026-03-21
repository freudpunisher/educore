// app/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-accent/5 -z-10" />
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px] -z-10 animate-pulse duration-2000" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10" />

      <LoginForm />
    </div>
  );
}

export const metadata = {
  title: "Connexion - Gestion Scolaire",
};