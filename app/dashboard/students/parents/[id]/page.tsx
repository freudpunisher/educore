"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Phone, Mail, MapPin, Users, Heart, User, CalendarDays, BookOpen, UserCheck } from "lucide-react"
import Link from "next/link"
import { parentListSchema } from "@/hooks/use-parents"

const parentDetailSchema = parentListSchema.extend({
  children_count: z.number(),
})

const studentChildSchema = z.object({
  id: z.number(),
  student: z.number(),
  account: z.number(),
  relationship: z.string(),
  is_primary_contact: z.boolean(),
  student_name: z.string().optional(),
  enrollment_number: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  class_name: z.string().optional().nullable(),
  date_enrolled: z.string().optional().nullable(),
  is_current: z.boolean().optional(),
})

type ParentDetail = z.infer<typeof parentDetailSchema>
type StudentChild = z.infer<typeof studentChildSchema>

const RELATIONSHIP_LABELS: Record<string, string> = {
  mother: "Mother",
  father: "Father",
  guardian: "Guardian",
  stepmother: "Step Mother",
  stepfather: "Step Father",
  brother: "Brother",
  sister: "Sister",
  uncle: "Uncle",
  aunt: "Aunt",
  grandfather: "Grandfather",
  grandmother: "Grandmother",
  cousin: "Cousin",
  nephew: "Nephew",
  niece: "Niece",
  other: "Other",
}

export default function ParentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const parentId = Number(params.id)

  const { data: parent, isLoading: parentLoading } = useQuery({
    queryKey: ["parent-detail", parentId],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(`users/accounts/${parentId}/`)
      const payload = raw?.data || raw
      return parentDetailSchema.parse({ ...payload, children_count: 0 })
    },
    enabled: !!parentId,
  })

  const { data: children = [], isLoading: childrenLoading, error: childrenError } = useQuery({
    queryKey: ["parent-children", parentId],
    queryFn: async () => {
      const resp = await axiosInstance.get(`users/accounts/${parentId}/children/`)
      const raw = resp.data
      const payload = raw?.data ?? raw
      if (!Array.isArray(payload)) {
        console.error("[ParentDetail] API response not array:", payload)
        return []
      }
      return payload
    },
    enabled: !!parentId,
  })

  if (childrenError) {
    console.error("[ParentDetail] children query error:", childrenError)
  }

  if (parentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Parent not found
      </div>
    )
  }

  const fullName = [parent.user.first_name, parent.user.last_name].filter(Boolean).join(" ") || parent.user.username
  const initials = ((parent.user.first_name?.[0] || "") + (parent.user.last_name?.[0] || "")).toUpperCase() || "P"

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/students")} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Students & Parents
      </Button>

      <div className="flex items-start gap-6">
        <Avatar className="w-20 h-20 rounded-2xl">
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary rounded-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Heart className="w-4 h-4 text-primary" />
                Parent / Guardian
              </p>
            </div>
            <Badge variant={parent.active ? "default" : "secondary"} className={parent.active ? "bg-green-100 text-green-700" : ""}>
              {parent.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">@{parent.user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{parent.user.email || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary" className="text-xs">Parent</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{parent.phone_number || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{parent.user.email || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{parent.address || "Not specified"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Children
            <Badge variant="secondary" className="ml-2 font-mono">{children.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {childrenLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : childrenError ? (
            <div className="text-center py-8">
              <p className="text-destructive font-medium">Failed to load children data.</p>
              <p className="text-xs text-muted-foreground mt-1">Error: {childrenError?.message || "Unknown"}</p>
            </div>
          ) : children.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No children assigned to this parent.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <Link key={child.id} href={`/dashboard/students/${child.student}`}>
                  <div className="flex flex-col p-5 rounded-xl border hover:bg-muted/30 transition-colors cursor-pointer group h-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary/10 transition-colors shrink-0">
                        {(child.student_name?.[0] || "S").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{child.student_name || "Unknown Student"}</p>
                          {child.is_current && (
                            <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 h-5 shrink-0">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {RELATIONSHIP_LABELS[child.relationship] || child.relationship}
                          </span>
                          {child.is_primary_contact && (
                            <>
                              <span>·</span>
                              <Badge variant="outline" className="text-[10px] px-1 h-4 text-primary border-primary/30">Primary</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
                      {child.enrollment_number && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-mono">{child.enrollment_number}</span>
                        </div>
                      )}
                      {child.class_name && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>{child.class_name}</span>
                        </div>
                      )}
                      {child.gender && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span>{child.gender}</span>
                        </div>
                      )}
                      {child.date_of_birth && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                          <span>{new Date(child.date_of_birth).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {child.date_enrolled && (
                      <div className="mt-3 pt-3 border-t text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3" />
                        Enrolled: {new Date(child.date_enrolled).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
