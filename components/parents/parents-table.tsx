"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Phone, Mail, Users, Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ParentItem {
  id: number
  user: {
    id: number
    username: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
  }
  phone_number?: string | null
  address?: string | null
  active: boolean
  children_count: number
}

interface ParentsTableProps {
  parents: ParentItem[]
  isLoading: boolean
  error: boolean
  totalCount: number
  currentPage: number
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (search: string) => void
}

const PAGE_SIZE = 10

export default function ParentsTable({
  parents,
  isLoading,
  error,
  totalCount,
  currentPage,
  onPageChange,
  search,
  onSearchChange,
}: ParentsTableProps) {
  const router = useRouter()
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search parents..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Name</th>
                <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Contact</th>
                <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Address</th>
                <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Children</th>
                <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right p-3 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      Loading parents...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-destructive">Failed to load parents</td>
                </tr>
              ) : parents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">No parents found</td>
                </tr>
              ) : (
                parents.map((parent) => (
                  <tr
                    key={parent.id}
                    className="border-t hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/students/parents/${parent.id}`)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {((parent.user.first_name?.[0] || "") + (parent.user.last_name?.[0] || "")).toUpperCase() || "P"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {[parent.user.first_name, parent.user.last_name].filter(Boolean).join(" ") || parent.user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{parent.user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {parent.phone_number && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" /> {parent.phone_number}
                          </span>
                        )}
                        {parent.user.email && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" /> {parent.user.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">
                      {parent.address || "-"}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className="font-mono gap-1">
                        <Users className="w-3 h-3" />
                        {parent.children_count}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={parent.active ? "default" : "secondary"} className={parent.active ? "bg-green-100 text-green-700" : ""}>
                        {parent.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/students/parents/${parent.id}`)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)} to{" "}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
