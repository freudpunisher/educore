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
  role: "admin" | "teacher" | "driver" | "parent" | "none";
  fullName: string;
  isActive: boolean;
  // Helper method
  is: (role: string) => boolean;
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
  const [isLoading, setIsLoading] = useState(false); // Can be true if we add hydration logic

  const login = (data: any) => {
    console.log("AuthContext: Login called with data:", data);

    // Support both nested { user: profile } and flat { id, username, ... } response
    const profile = data.user || data;

    // Check if we have at least some user info (id or username)
    const hasUserInfo = profile && (profile.id || profile.username || (profile.user && profile.user.username));

    if (!hasUserInfo) {
      console.warn("AuthContext: No user information found in response", data);
      // If we're just ignoring it as per user request, we can stop here or proceed with empty user
      return;
    }

    const userData = profile.user || (profile.id ? profile : null);

    const fullName =
      userData && (userData.first_name || userData.last_name)
        ? [userData.first_name, userData.last_name]
          .filter(Boolean)
          .join(" ")
          .trim()
        : userData?.username || profile.username || "Utilisateur";

    const cleanUser: User = {
      id: profile.id || userData?.id || 0,
      username: userData?.username || profile.username || "unknown",
      email: userData?.email || profile.email || "",
      role: (profile.role as User["role"]) || (userData?.role as User["role"]) || "none",
      fullName,
      isActive: profile.active !== undefined ? !!profile.active : true,
      is: (role: string) => (profile.role === role || userData?.role === role),
    };

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

  // Re-hydration logic
  useEffect(() => {
    const savedUser = localStorage.getItem("user_data");
    const token = localStorage.getItem("access_token");

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Add helper method back since it's not restored by JSON.parse
        parsedUser.is = (role: string) => parsedUser.role === role;
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to parse saved user data:", err);
        logout();
      }
    }
    setIsLoading(false);
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