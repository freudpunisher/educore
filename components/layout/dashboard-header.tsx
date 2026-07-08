// components/layout/dashboard-header.tsx
"use client";

import { Zap, User, Moon, Sun, LogOut, Users, GraduationCap, DollarSign, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationButton } from "@/components/layout/notification-button";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-provider";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      global_control: "Global Control",
      system_admin: "System Admin",
      body_control: "Body Control",
      director: "Director",
      academic_principal: "Academic Principal",
      discipline_principal: "Discipline Principal",
      receptionist: "Receptionist",
      accountant: "Accountant",
      hr: "Human Resources",
      transporter: "Transporter",
      teacher: "Teacher",
      student_parent: "Parent",
      student: "Student",
      boarding: "Boarding Manager",
      daycare: "Daycare Manager",
      restaurant: "Restaurant Manager",
      storage: "Storage Manager",
      none: "No Role",
    };
    return labels[role] || role;
  };

  // Generate initials from fullName
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Shortcut Actions */}
      <div className="flex-1 max-w-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Quick Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Shortcuts</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/students")}>
              <Users className="mr-2 h-4 w-4" />
              New Student
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/pedagogy")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              New Course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/finances")}>
              <DollarSign className="mr-2 h-4 w-4" />
              New Payment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/calendar")}>
              <Calendar className="mr-2 h-4 w-4" />
              Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="sr-only">Changer le thème</span>
        </Button>

        {/* Notifications (cloche dynamique) */}
        <NotificationButton />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 hover:bg-muted">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {user ? getInitials(user.fullName) : <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold leading-none">
                  {user?.fullName || "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user ? getRoleLabel(user.role) : "Chargement..."}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {user && getRoleLabel(user.role)}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}