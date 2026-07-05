"use client"

import { useDirectorFinances } from "@/hooks/use-director-dashboard"
import { KpiGrid, type KpiCardData } from "@/components/dashboard/kpi-grid"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, DollarSign, Wallet, Receipt, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"
import {
  Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts"

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-BI").format(n) + " BIF"
}

interface Props {
  filters?: Record<string, string | number | undefined>
}

export function FinancesTab({ filters }: Props) {
  const { data, isLoading, error } = useDirectorFinances(filters)

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>Impossible de charger les données financières.</AlertDescription>
      </Alert>
    )
  }

  if (!data && isLoading) return <LoadingSkeleton />
  if (!data) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Aucune donnée</AlertTitle>
        <AlertDescription>Aucune donnée financière disponible.</AlertDescription>
      </Alert>
    )
  }

  const kpis: KpiCardData[] = [
    {
      title: "Total Attendu",
      value: fmt(data.kpis.total_expected),
      sub: "Montant total facturé",
      icon: <Receipt className="w-5 h-5 text-purple-600" />,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Payé",
      value: fmt(data.kpis.total_paid),
      sub: `${((data.kpis.total_paid / (data.kpis.total_expected || 1)) * 100).toFixed(1)}% encaissé`,
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Restant à Recouvrer",
      value: fmt(data.kpis.outstanding),
      sub: `Dont ${fmt(data.kpis.overdue)} en impayés > 30 jours`,
      icon: <Wallet className="w-5 h-5 text-rose-600" />,
      color: "text-rose-600",
      bgColor: "bg-rose-500/10",
    },
    {
      title: "Recette Annuelle",
      value: fmt(data.kpis.revenue_year),
      sub: `${fmt(data.kpis.revenue_month)} ce mois · ${fmt(data.kpis.revenue_today)} aujourd'hui`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
  ]

  const paymentColumns = [
    { key: "student_name" as const, label: "Élève", sortable: true },
    { key: "amount" as const, label: "Montant", sortable: true, render: (v: number) => fmt(v) },
    { key: "date" as const, label: "Date", sortable: true },
    { key: "payment_mode" as const, label: "Mode", sortable: true },
  ]

  return (
    <>
      <KpiGrid cards={kpis} isLoading={isLoading} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Évolution Mensuelle des Recettes</CardTitle>
            <CardDescription>Montants attendus vs collectés</CardDescription>
          </CardHeader>
          <CardContent>
            {data.monthly_revenue.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} tickFormatter={(v) => new Intl.NumberFormat("fr-BI", { notation: "compact" }).format(v)} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} formatter={(v) => [fmt(Number(v)), ""]} />
                  <Legend />
                  <Bar dataKey="expected" name="Attendu" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="collected" name="Collecté" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Courbe des Remboursements</CardTitle>
          </CardHeader>
          <CardContent>
            {data.refund_trend.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.refund_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} tickFormatter={(v) => fmt(v)} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} formatter={(v) => [fmt(Number(v)), "Remboursé"]} />
                  <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: "#ef4444" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Comparatif Annuel</CardTitle>
          </CardHeader>
          <CardContent>
            {data.year_comparison.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.year_comparison}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} className="text-xs font-bold text-muted-foreground" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" dx={-10} tickFormatter={(v) => fmt(v)} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} formatter={(v) => [fmt(Number(v)), "Payé"]} />
                  <Bar dataKey="total_paid" name="Total Payé" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Derniers Paiements Reçus</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={paymentColumns}
              data={data.recent_payments.map((p) => ({ ...p, id: p.id }))}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-none">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-muted/50 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-none">
            <CardHeader>
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted/30 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
