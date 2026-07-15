"use client";

import { useAuth } from "@/lib/auth-context";

export function useModulePermissions(moduleName: string) {
  const { user } = useAuth();

  return {
    canView: user?.can(`${moduleName}.view`) ?? false,
    canManage: user?.can(`${moduleName}.manage`) ?? false,
    canDelete: user?.can(`${moduleName}.delete`) ?? false,
  };
}
