"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Download, Plus } from "lucide-react"
import { mockTimetable } from "@/lib/mock-data"

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("5ème A")

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
  const timeSlots = ["08:00-09:00", "09:00-10:00", "10:15-11:15", "11:15-12:15", "14:00-15:00", "15:00-16:00"]

  const getSlotForDayAndTime = (day: string, timeSlot: string) => {
    const [start] = timeSlot.split("-")
    return mockTimetable.find((slot) => slot.day === day && slot.startTime === start && slot.class === selectedClass)
  }

  const subjectColors: Record<string, string> = {
    Mathématiques: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
    Français: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
    Anglais: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
    "Histoire-Géographie": "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
    Sciences: "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emploi du temps</h1>
          <p className="text-muted-foreground">Planning hebdomadaire des cours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un cours
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Planning de la semaine
              </CardTitle>
              <CardDescription>Emploi du temps détaillé par classe</CardDescription>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6ème A">6ème A</SelectItem>
                <SelectItem value="6ème B">6ème B</SelectItem>
                <SelectItem value="5ème A">5ème A</SelectItem>
                <SelectItem value="5ème B">5ème B</SelectItem>
                <SelectItem value="4ème A">4ème A</SelectItem>
                <SelectItem value="4ème B">4ème B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2">
                <div className="font-medium text-sm text-muted-foreground p-2">Horaires</div>
                {days.map((day) => (
                  <div key={day} className="font-medium text-sm text-center text-foreground p-2">
                    {day}
                  </div>
                ))}

                {timeSlots.map((timeSlot) => (
                  <>
                    <div key={`time-${timeSlot}`} className="text-sm text-muted-foreground p-2 flex items-center">
                      {timeSlot}
                    </div>
                    {days.map((day) => {
                      const slot = getSlotForDayAndTime(day, timeSlot)
                      return (
                        <div key={`${day}-${timeSlot}`} className="p-1">
                          {slot ? (
                            <div
                              className={`p-3 rounded-lg border-2 ${subjectColors[slot.subject] || "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"}`}
                            >
                              <div className="font-medium text-sm text-foreground">{slot.subject}</div>
                              <div className="text-xs text-muted-foreground mt-1">{slot.teacher}</div>
                              <div className="text-xs text-muted-foreground">{slot.room}</div>
                            </div>
                          ) : (
                            <div className="h-full min-h-20 border-2 border-dashed border-border rounded-lg" />
                          )}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
