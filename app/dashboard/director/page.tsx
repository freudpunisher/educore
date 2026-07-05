"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OverviewTab } from "./overview-tab"
import { FinancesTab } from "./finances-tab"
import { SchoolLifeTab } from "./school-life-tab"
import { PedagogyTab } from "./pedagogy-tab"

type DateRange = "" | "today" | "week" | "month" | "quarter" | "semester" | "year"

export default function DirectorDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange>("")
  const [activeTab, setActiveTab] = useState("overview")

  const filters = dateRange ? { date_range: dateRange } : undefined

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">
            Initialisation du tableau de bord...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">
            Tableau de Bord Directeur
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Vue stratégique de l&apos;établissement — <span className="text-primary font-bold">{user.fullName}</span>
          </p>
        </div>
      </div>

      {/* Global Filters Bar */}
      <Card className="border-none shadow-sm bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Période
            </span>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Toute l'année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="semester">Ce semestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="overview" className="text-sm font-semibold py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            📊 Vue Globale & Inscriptions
          </TabsTrigger>
          <TabsTrigger value="finances" className="text-sm font-semibold py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            💰 Finances & Trésorerie
          </TabsTrigger>
          <TabsTrigger value="school-life" className="text-sm font-semibold py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            🚌 Vie Scolaire & Logistique
          </TabsTrigger>
          <TabsTrigger value="pedagogy" className="text-sm font-semibold py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            🎓 Pédagogie & Alertes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <OverviewTab filters={filters} />
        </TabsContent>

        <TabsContent value="finances" className="space-y-6 mt-0">
          <FinancesTab filters={filters} />
        </TabsContent>

        <TabsContent value="school-life" className="space-y-6 mt-0">
          <SchoolLifeTab filters={filters} />
        </TabsContent>

        <TabsContent value="pedagogy" className="space-y-6 mt-0">
          <PedagogyTab filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
