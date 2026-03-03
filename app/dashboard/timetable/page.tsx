"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Download, Plus } from "lucide-react"
import { mockTimetable } from "@/lib/mock-data"

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("5th A")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = ["08:00-09:00", "09:00-10:00", "10:15-11:15", "11:15-12:15", "14:00-15:00", "15:00-16:00"]

  const getSlotForDayAndTime = (day: string, timeSlot: string) => {
    const [start] = timeSlot.split("-")
    return mockTimetable.find((slot) => slot.day === day && slot.startTime === start && slot.class === selectedClass)
  }

  const subjectColors: Record<string, string> = {
    Mathematics: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
    French: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
    English: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
    "History-Geography": "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
    Sciences: "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground">Weekly course schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>Detailed timetable by class</CardDescription>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6th A">6th A</SelectItem>
                <SelectItem value="6th B">6th B</SelectItem>
                <SelectItem value="5th A">5th A</SelectItem>
                <SelectItem value="5th B">5th B</SelectItem>
                <SelectItem value="4th A">4th A</SelectItem>
                <SelectItem value="4th B">4th B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2">
                <div className="font-medium text-sm text-muted-foreground p-2">Schedule</div>
                {days.map((day) => (
                  <div key={day} className="font-medium text-sm text-center text-foreground p-2">
                    {day}
                  </div>
                ))}

                {timeSlots.map((timeSlot) => (
                  <React.Fragment key={`time-slot-${timeSlot}`}>
                    <div className="text-sm text-muted-foreground p-2 flex items-center">
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
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
