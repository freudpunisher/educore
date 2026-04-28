"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ReactNode } from "react"

interface KpiCardProps {
  title: string
  value: string | number | null
  sub?: string | null
  icon: ReactNode
  color: string
  bgColor: string
  isLoading?: boolean
}

export function KpiCard({
  title,
  value,
  sub,
  icon,
  color,
  bgColor,
  isLoading = false,
}: KpiCardProps) {
  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300 border-none bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
          {title}
        </CardTitle>
        <div className={`p-3 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {value === null || isLoading ? (
          <div className="flex items-center gap-2 h-9">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="text-2xl font-heading font-bold text-foreground/90 leading-tight">
            {value}
          </div>
        )}
        {sub && (
          <p className="text-[11px] text-muted-foreground font-medium mt-2">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}
