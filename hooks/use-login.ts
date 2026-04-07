// src/hooks/use-login.ts
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.Schema";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      // Exactly what your backend expects
      const { data } = await axiosInstance.post("login/", {
        username: credentials.username,
        password: credentials.password,
      });
      return data; // { token, user: { id, username, role, ... } }
    },
    onSuccess: (data) => {
      login(data);
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Incorrect username or password";
      throw new Error(message);
    },
  });
}