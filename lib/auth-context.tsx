// src/lib/auth-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axiosInstance from "./axios";

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
  permissions?: string[];
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
  email: string;
  role: string;
  fullName: string;
  isActive: boolean;
  permissions: string[];
  // Helper methods
  is: (role: string) => boolean;
  can: (permission: string) => boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set to true for hydration

  const login = (data: any) => {
    console.log("AuthContext: Login called with data:", data);

    // Support both nested { user: profile } and flat { id, username, ... } response
    const profile = data.user || data;

    // Check if we have at least some user info (id or username), or if we have tokens
    const hasUserInfo = profile && (profile.id || profile.username || (profile.user && profile.user.username));
    
    let cleanUser: User;

    if (!hasUserInfo) {
      console.warn("AuthContext: No user information found in response, creating a fallback user from tokens", data);
      
      if (!data.access) {
         return; // If no tokens either, fail
      }
      
      cleanUser = {
        id: 0,
        username: "user",
        email: "",
        role: "none",
        permissions: [],
        fullName: "Utilisateur",
        isActive: true,
        is: (role: string) => role === "none",
        can: () => false,
      };
    } else {
      const userData = profile.user || (profile.id ? profile : null);

      const fullName =
        userData && (userData.first_name || userData.last_name)
          ? [userData.first_name, userData.last_name]
            .filter(Boolean)
            .join(" ")
            .trim()
          : userData?.username || profile.username || "User";

      const permissions = profile.permissions || (userData as any)?.permissions || [];

      cleanUser = {
        id: profile.id || userData?.id || 0,
        username: userData?.username || profile.username || "unknown",
        email: userData?.email || profile.email || "",
        role: (profile.role as User["role"]) || (userData?.role as User["role"]) || "none",
        permissions,
        fullName,
        isActive: profile.active !== undefined ? !!profile.active : true,
        is: (role: string) => (profile.role === role || userData?.role === role),
        can: (permission: string) => permissions.includes(permission),
      };
    }

    setUser(cleanUser);

    // Save tokens and user in localStorage
    if (data.access) localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user_data", JSON.stringify(cleanUser));
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await axiosInstance.post("logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  // Re-hydration synchrone depuis localStorage, puis refresh async des permissions
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Étape 1 : restaurer synchrone depuis localStorage (évite les sauts de hooks)
    const savedUser = localStorage.getItem("user_data");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        parsedUser.is = (role: string) => parsedUser.role === role;
        parsedUser.can = (permission: string) => parsedUser.permissions?.includes(permission) ?? false;
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to parse saved user data:", err);
      }
    }
    setIsLoading(false);

    // Étape 2 : refresh async des permissions depuis le backend
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("me/");
        const profile = res.data?.data ?? res.data;
        const userData = profile.user || profile;
        const permissions = profile.permissions || (userData as any)?.permissions || [];

        const freshUser: User = {
          id: profile.id || userData?.id || 0,
          username: userData?.username || profile.username || "unknown",
          email: userData?.email || profile.email || "",
          role: (profile.role as User["role"]) || (userData?.role as User["role"]) || "none",
          permissions,
          fullName:
            userData && (userData.first_name || userData.last_name)
              ? [userData.first_name, userData.last_name].filter(Boolean).join(" ").trim()
              : userData?.username || profile.username || "User",
          isActive: profile.active !== undefined ? !!profile.active : true,
          is: (role: string) => (profile.role === role || userData?.role === role),
          can: (permission: string) => permissions.includes(permission),
        };

        setUser(freshUser);
        localStorage.setItem("user_data", JSON.stringify(freshUser));
      } catch (err) {
        console.error("Failed to refresh user profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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