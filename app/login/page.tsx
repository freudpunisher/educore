// app/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <LoginForm />
    </div>
  );
}

export const metadata = {
  title: "Connexion - Gestion Scolaire",
};