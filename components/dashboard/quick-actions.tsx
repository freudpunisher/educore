"use client"

import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

export interface QuickAction {
  label: string
  icon: ReactNode
  href?: string
  onClick?: () => void
  variant?: "default" | "outline"
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outline"}
          className="rounded-xl font-bold"
          onClick={action.onClick}
          asChild={!!action.href}
        >
          {action.href ? (
            <a href={action.href}>
              {action.icon && <span className="w-4 h-4 mr-2">{action.icon}</span>}
              {action.label}
            </a>
          ) : (
            <>
              {action.icon && <span className="w-4 h-4 mr-2">{action.icon}</span>}
              {action.label}
            </>
          )}
        </Button>
      ))}
    </div>
  )
}
