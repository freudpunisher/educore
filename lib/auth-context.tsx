// src/lib/auth-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BackendUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

type BackendProfile = {
  id: number;
  user: BackendUser;
  role: string;
  active: boolean;
  address: string;
  phone_number: string | null;
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: BackendProfile;
  expires_in: number;
};

// Clean user stored in context
export type User = {
  id: number;
  username: string;
  role: "admin" | "teacher" | "driver" | "parent" | "none";
  fullName: string;
  isActive: boolean;
  // Helper method
  is: (role: string) => boolean;
};

type AuthContextType = {
  user: User | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (data: LoginResponse) => {
    const profile = data.user;

    const fullName = [profile.user.first_name, profile.user.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || profile.user.username;

    const cleanUser: User = {
      id: profile.id,
      username: profile.user.username,
      role: profile.role as User["role"],
      fullName,
      isActive: profile.active,
      is: (role: string) => profile.role === role, // Helper function
    };

    setUser(cleanUser);

    // Save tokens in localStorage (or use httpOnly cookies if your backend sets them)
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}