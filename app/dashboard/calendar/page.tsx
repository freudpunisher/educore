"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type SchoolEvent = {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  event_type: "holiday" | "exam" | "event" | "meeting" | "other";
  location: string | null;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<SchoolEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const resp = await api.get<any>("academics/events/")
      setEvents(Array.isArray(resp) ? resp : resp.results || [])
    } catch {
      toast.error("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const data = {
      title: fd.get("title"),
      description: fd.get("description"),
      start_date: fd.get("start_date"),
      end_date: fd.get("end_date") || null,
      event_type: fd.get("event_type"),
      location: fd.get("location"),
    }

    try {
      await api.post("academics/events/", data)
      toast.success("Event created successfully")
      setIsModalOpen(false)
      fetchEvents()
    } catch {
      toast.error("Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      holiday: "bg-blue-500",
      exam: "bg-red-500",
      event: "bg-green-500",
      meeting: "bg-yellow-500",
      other: "bg-gray-500",
    }
    return colors[type] || colors.other
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.start_date === dateStr)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Events, exams, and school holidays</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const events = getEventsForDate(day)
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear()

                return (
                  <div
                    key={day}
                    className={`min-h-20 p-2 border border-border rounded-lg ${isToday ? "bg-primary/10 border-primary" : "bg-card"}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded ${getEventTypeColor(event.event_type)} text-white truncate`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next important events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .filter(e => new Date(e.start_date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className={`w-2 rounded-full ${getEventTypeColor(event.event_type)}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(event.start_date).toLocaleDateString("en-US")}
                        </Badge>
                        {event.location && <span className="text-xs text-muted-foreground">{event.location}</span>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New School Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" placeholder="e.g. End of Term Celebration" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input id="end_date" name="end_date" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_type">Type</Label>
                <Select name="event_type" defaultValue="event">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g. Main Hall" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Short event summary..." rows={3} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
