"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Download, Plus, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type ClassRoom = {
  id: number;
  code: string;
  name: string;
};

type TimetableSlot = {
  id: number;
  course: number;
  course_name: string;
  teacher_name: string;
  classroom_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
};

type Course = {
  id: number;
  name: string;
  teacher_name: string;
};

export default function TimetablePage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([])
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [newSlot, setNewSlot] = useState({
    course: "",
    day_of_week: "0",
    start_time: "08:00",
    end_time: "09:00",
    room: "",
  })

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = ["08:00-09:00", "09:00-10:00", "10:15-11:15", "11:15-12:15", "14:00-15:00", "15:00-16:00"]

  useEffect(() => {
    fetchClassRooms()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      fetchTimetable(selectedClassId)
      fetchCourses(selectedClassId)
    }
  }, [selectedClassId])

  const fetchClassRooms = async () => {
    try {
      const resp = await api.get<any>("config/classrooms/")
      const data = resp.results || resp
      setClassRooms(data)
      if (data.length > 0) {
        setSelectedClassId(data[0].id.toString())
      }
    } catch {
      toast.error("Failed to load classrooms")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTimetable = async (classId: string) => {
    setIsLoading(true)
    try {
      const resp = await api.get<any>(`config/timetable/?course__classroom=${classId}`)
      setSlots(resp.results || resp)
    } catch {
      toast.error("Failed to load timetable")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourses = async (classId: string) => {
    try {
      const resp = await api.get<any>(`config/courses/?classroom=${classId}`)
      setCourses(resp.results || resp)
    } catch {
      toast.error("Failed to load courses")
    }
  }

  const createSlot = async () => {
    if (!newSlot.course) {
      toast.error("Please select a course")
      return
    }
    setIsAdding(true)
    try {
      await api.post("config/timetable/", {
        ...newSlot,
        course: parseInt(newSlot.course),
        day_of_week: parseInt(newSlot.day_of_week),
      })
      toast.success("Timetable slot created")
      setIsDialogOpen(false)
      fetchTimetable(selectedClassId)
    } catch {
      toast.error("Failed to create slot")
    } finally {
      setIsAdding(false)
    }
  }

  const getSlotForDayAndTime = (dayIndex: number, timeSlot: string) => {
    const [start] = timeSlot.split("-")
    // Match by day index and start time (HH:MM)
    return slots.find((s) => s.day_of_week === dayIndex && s.start_time.startsWith(start))
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Timetable Slot</DialogTitle>
                <DialogDescription>Schedule a new course for this class.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={newSlot.course} onValueChange={(v) => setNewSlot({ ...newSlot, course: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name} ({c.teacher_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="day">Day</Label>
                    <Select value={newSlot.day_of_week} onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day, i) => (
                          <SelectItem key={day} value={i.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      placeholder="Ex: Room 101"
                      value={newSlot.room}
                      onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start">Start Time</Label>
                    <Input
                      id="start"
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end">End Time</Label>
                    <Input
                      id="end"
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSlot} disabled={isAdding}>
                  {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Slot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classRooms.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
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
                  <div key={`time-slot-${timeSlot}`} className="contents">
                    <div className="text-sm text-muted-foreground p-2 flex items-center">
                      {timeSlot}
                    </div>
                    {days.map((day, dayIndex) => {
                      const slot = getSlotForDayAndTime(dayIndex, timeSlot)
                      return (
                        <div key={`${day}-${timeSlot}`} className="p-1">
                          {slot ? (
                            <div
                              className={`p-3 rounded-lg border-2 ${subjectColors[slot.course_name] || "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"}`}
                            >
                              <div className="font-medium text-sm text-foreground">{slot.course_name}</div>
                              <div className="text-xs text-muted-foreground mt-1">{slot.teacher_name}</div>
                              <div className="text-xs text-muted-foreground">{slot.room}</div>
                            </div>
                          ) : (
                            <div className="h-full min-h-20 border-2 border-dashed border-border rounded-lg" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
