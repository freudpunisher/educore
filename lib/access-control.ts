import { FULL_ACCESS, ManageableModule } from "@/constants/full-access"

export function canManage(role: string | undefined, module: ManageableModule): boolean {
  if (!role) return false
  const allowed = FULL_ACCESS[module]
  if (!allowed) return false
  return allowed.includes(role)
}
