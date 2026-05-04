"use client"

import { KpiCard } from "./kpi-card"
import { ReactNode } from "react"

export interface KpiCardData {
  title: string
  value: string | number | null
  sub?: string | null
  icon: ReactNode
  color: string
  bgColor: string
}

interface KpiGridProps {
  cards: KpiCardData[]
  isLoading?: boolean
}

export function KpiGrid({ cards, isLoading = false }: KpiGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiCard
          key={card.title}
          title={card.title}
          value={card.value}
          sub={card.sub}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
