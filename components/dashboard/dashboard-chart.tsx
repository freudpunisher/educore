"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface ChartData {
  name: string
  amount: number | string
}

interface DashboardChartProps {
  title: string
  description: string
  data: ChartData[]
  isLoading: boolean
  formatter?: (value: any) => string
}

export function DashboardChart({
  title,
  description,
  data,
  isLoading,
  formatter,
}: DashboardChartProps) {
  return (
    <Card className="border-none shadow-xl shadow-primary/5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[320px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="oklch(var(--border) / 0.5)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-[10px] font-bold text-muted-foreground"
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-[10px] font-bold text-muted-foreground"
                dx={-10}
                tickFormatter={(v) =>
                  formatter ? formatter(v) : new Intl.NumberFormat("fr-BI", { notation: "compact" }).format(v)
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontWeight: "bold" }}
                formatter={(value: any) => [formatter ? formatter(value) : value, "Amount"]}
              />
              <Bar
                dataKey="amount"
                fill="oklch(var(--primary))"
                radius={[8, 8, 4, 4]}
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
