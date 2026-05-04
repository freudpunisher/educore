"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

export interface ActivityItem {
  action: string
  name: string
  time: string
  color: string
  icon: ReactNode
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-none shadow-xl shadow-primary/5 last-section mt-4 mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Institutional Activity</CardTitle>
          <CardDescription>Real-time updates from all school departments</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="font-bold text-primary rounded-lg">
          View All Logs
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${activity.color}/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className={`w-5 h-5 ${activity.color.replace("bg-", "text-")}`}>
                    {activity.icon}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-foreground/90">{activity.action}</p>
                  <p className="text-sm text-muted-foreground font-medium">{activity.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-tighter">
                  {activity.time}
                </span>
                <div className="mt-1 h-1 w-8 bg-muted rounded-full ml-auto group-hover:w-full group-hover:bg-primary/20 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
