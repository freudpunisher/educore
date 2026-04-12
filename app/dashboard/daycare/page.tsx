"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
    Baby,
    Clock,
    Moon,
    Loader2,
    CalendarDays,
    Sun,
    Sunset,
    MoreHorizontal,
    Utensils,
    Play,
    CheckCircle,
    FileText,
    Plus
} from "lucide-react"

type DashboardStats = {
    children_today: number;
    checked_in: number;
    meal_recorded: number;
    nap_recorded: number;
    checked_out: number;
    reports_generated: number;
    morning_activities_logged: number;
    afternoon_activities_logged: number;
    average_nap_minutes: number;
}

type DailyRecord = {
    id: number;
    child: number;
    child_name: string;
    child_enrollment_number: string;
    date: string;
    check_in_time: string | null;
    meal_time: string | null;
    nap_start_time: string | null;
    nap_end_time: string | null;
    check_out_time: string | null;
    has_completed_day: boolean;
}

type DaycareActivity = {
    id: number;
    name: string;
    session: string;
    description: string;
}

type Student = {
    id: number;
    full_name: string;
    enrollment_number: string;
}

export default function DaycarePage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [records, setRecords] = useState<DailyRecord[]>([])
    const [activities, setActivities] = useState<DaycareActivity[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [isLoadingStats, setIsLoadingStats] = useState(true)
    const [isLoadingRecords, setIsLoadingRecords] = useState(true)

    // Dialog States
    const [activeRecord, setActiveRecord] = useState<DailyRecord | null>(null)
    const [dialogType, setDialogType] = useState<"new" | "meal" | "nap" | "activity" | "report" | null>(null)

    // Form States
    const [selectedStudent, setSelectedStudent] = useState("")
    const [mealNotes, setMealNotes] = useState("")
    const [napStart, setNapStart] = useState("")
    const [napEnd, setNapEnd] = useState("")
    const [selectedActivity, setSelectedActivity] = useState("")
    const [selectedSession, setSelectedSession] = useState("")

    useEffect(() => {
        fetchDashboardStats()
        fetchDailyRecords()
        fetchActivities()
    }, [])

    const fetchDashboardStats = async () => {
        setIsLoadingStats(true)
        try {
            const resp = await api.get<DashboardStats>("daycare/dashboard/")
            setStats(resp)
        } catch {
            toast.error("Failed to load daycare statistics")
        } finally {
            setIsLoadingStats(false)
        }
    }

    const fetchStudents = async () => {
        try {
            const resp = await api.get<any>("users/students/")
            setStudents(resp.results || resp)
        } catch {
            toast.error("Failed to load students")
        }
    }

    const fetchDailyRecords = async () => {
        setIsLoadingRecords(true)
        try {
            const today = new Date().toISOString().split('T')[0]
            const resp = await api.get<any>(`daycare/daily-records/?date=${today}`)
            setRecords(resp.results || resp)
        } catch {
            toast.error("Failed to load daily records")
        } finally {
            setIsLoadingRecords(false)
        }
    }

    const fetchActivities = async () => {
        try {
            const resp = await api.get<any>("daycare/activities/")
            setActivities(resp.results || resp)
        } catch {
            toast.error("Failed to load activities")
        }
    }

    const formatTime = (timeString: string | null) => {
        if (!timeString) return "—"
        return new Date(timeString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }

    // --- API Handlers ---

    const createRecord = async () => {
        if (!selectedStudent) return
        try {
            await api.post(`daycare/daily-records/`, {
                child: selectedStudent,
            })
            toast.success("Child registered for daycare today")
            closeDialogs()
            fetchDashboardStats()
            fetchDailyRecords()
        } catch {
            toast.error("Failed to create daycare record")
        }
    }

    const handleArrival = async (id: number) => {
        try {
            await api.post(`daycare/daily-records/${id}/arrival/`, {})
            toast.success("Check-in time recorded")
            fetchDashboardStats()
            fetchDailyRecords()
        } catch {
            toast.error("Failed to record check-in")
        }
    }

    const handleDeparture = async (id: number) => {
        try {
            await api.post(`daycare/daily-records/${id}/departure/`, {})
            toast.success("Check-out time recorded")
            fetchDashboardStats()
            fetchDailyRecords()
        } catch {
            toast.error("Failed to record check-out")
        }
    }

    const submitMeal = async () => {
        if (!activeRecord) return
        try {
            await api.post(`daycare/daily-records/${activeRecord.id}/meal/`, {
                meal_time: new Date().toISOString(),
                meal_notes: mealNotes
            })
            toast.success("Meal recorded")
            closeDialogs()
            fetchDailyRecords()
        } catch {
            toast.error("Failed to record meal")
        }
    }

    const submitNap = async () => {
        if (!activeRecord || !napStart || !napEnd) return
        try {
            const today = new Date().toISOString().split('T')[0]
            await api.post(`daycare/daily-records/${activeRecord.id}/nap/`, {
                nap_start_time: `${today}T${napStart}:00Z`,
                nap_end_time: `${today}T${napEnd}:00Z`
            })
            toast.success("Nap recorded")
            closeDialogs()
            fetchDailyRecords()
            fetchDashboardStats()
        } catch {
            toast.error("Failed to record nap")
        }
    }

    const submitActivity = async () => {
        if (!activeRecord || !selectedActivity || !selectedSession) return
        try {
            await api.post(`daycare/activity-entries/`, {
                daily_record: activeRecord.id,
                activity: selectedActivity,
                session: selectedSession,
            })
            toast.success("Activity recorded")
            closeDialogs()
            fetchDailyRecords()
            fetchDashboardStats()
        } catch {
            toast.error("Failed to record activity")
        }
    }

    const generateReport = async () => {
        if (!activeRecord) return
        try {
            await api.post(`daycare/daily-records/${activeRecord.id}/generate_report/`, {})
            toast.success("Report generated")
            closeDialogs()
            fetchDailyRecords()
        } catch {
            toast.error("Failed to generate report")
        }
    }

    const closeDialogs = () => {
        setDialogType(null)
        setActiveRecord(null)
        setMealNotes("")
        setNapStart("")
        setNapEnd("")
        setSelectedActivity("")
        setSelectedSession("")
        setSelectedStudent("")
    }

    const openAction = (type: "new" | "meal" | "nap" | "activity" | "report", record?: DailyRecord) => {
        if (record) setActiveRecord(record)
        if (type === "new") fetchStudents()
        setDialogType(type)
    }

    const columns: any[] = [
        {
            key: "child_name",
            label: "Child",
            sortable: true,
            render: (_: any, r: DailyRecord) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{r.child_name}</span>
                    <span className="text-xs text-muted-foreground">{r.child_enrollment_number}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (_: any, r: DailyRecord) => (
                <div className="text-center">
                    {r.check_in_time && !r.check_out_time ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">Present</Badge>
                    ) : r.check_out_time ? (
                        <Badge variant="secondary">Departed</Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground">Expected</Badge>
                    )}
                </div>
            )
        },
        {
            key: "check_in_time",
            label: "In",
            render: (_: any, r: DailyRecord) => (
                <div className="flex flex-col items-center justify-center">
                    {r.check_in_time ? (
                        <span className="font-medium">{formatTime(r.check_in_time)}</span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            )
        },
        {
            key: "meal_time",
            label: "Meal",
            render: (_: any, r: DailyRecord) => (
                <div className="flex flex-col items-center justify-center">
                    {r.meal_time ? (
                        <span className="font-medium">{formatTime(r.meal_time)}</span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            )
        },
        {
            key: "nap_start_time",
            label: "Nap",
            render: (_: any, r: DailyRecord) => (
                <div className="flex flex-col items-center justify-center">
                    {r.nap_start_time ? (
                        <span className="font-medium">{formatTime(r.nap_start_time)} - {formatTime(r.nap_end_time)}</span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            )
        },
        {
            key: "check_out_time",
            label: "Out",
            render: (_: any, r: DailyRecord) => (
                <div className="flex flex-col items-center justify-center">
                    {r.check_out_time ? (
                        <span className="font-medium">{formatTime(r.check_out_time)}</span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            )
        },
        {
            key: "id",
            label: "Actions",
            render: (_: any, r: DailyRecord) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Workflow Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!r.check_in_time && (
                                <DropdownMenuItem onClick={() => handleArrival(r.id)}>
                                    <Play className="mr-2 h-4 w-4" /> Check-in
                                </DropdownMenuItem>
                            )}
                            {r.check_in_time && !r.check_out_time && (
                                <>
                                    <DropdownMenuItem onClick={() => openAction("activity", r)}>
                                        <Sun className="mr-2 h-4 w-4" /> Log Activity
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openAction("meal", r)}>
                                        <Utensils className="mr-2 h-4 w-4" /> Record Meal
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openAction("nap", r)}>
                                        <Moon className="mr-2 h-4 w-4" /> Record Nap
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDeparture(r.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Check-out
                                    </DropdownMenuItem>
                                </>
                            )}
                            {r.check_out_time && (
                                <DropdownMenuItem onClick={() => openAction("report", r)}>
                                    <FileText className="mr-2 h-4 w-4" /> Generate Report
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (

        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Daycare Management</h1>
                    <p className="text-muted-foreground">Monitor and manage daily daycare activities.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => { fetchDashboardStats(); fetchDailyRecords(); }}>
                        Refresh
                    </Button>
                    <Button onClick={() => openAction("new")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Register Child
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                        <CardTitle className="text-sm font-medium">Children Today</CardTitle>
                        <Baby className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.children_today || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total registered for today</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                        <CardTitle className="text-sm font-medium">Checked In</CardTitle>
                        <Clock className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats?.checked_in || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Currently arrived</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                        <CardTitle className="text-sm font-medium">Activities Logged</CardTitle>
                        <CalendarDays className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {(stats?.morning_activities_logged || 0) + (stats?.afternoon_activities_logged || 0)}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center"><Sun className="w-3 h-3 mr-1" />{stats?.morning_activities_logged || 0}</span>
                                    <span className="flex items-center"><Sunset className="w-3 h-3 mr-1" />{stats?.afternoon_activities_logged || 0}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                        <CardTitle className="text-sm font-medium">Avg Nap Time</CardTitle>
                        <Moon className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.average_nap_minutes || 0}m</div>
                                <p className="text-xs text-muted-foreground mt-1">Average sleep duration</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Records</CardTitle>
                    <CardDescription>Overview of all children enrolled in daycare for today.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingRecords ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            <Baby className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No children are recorded in the daycare today.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <DataTable
                                columns={columns}
                                data={records}
                                searchableColumns={["child_name", "child_enrollment_number"]}
                                itemsPerPage={10}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* --- Action Dialogs --- */}
            <Dialog open={dialogType === "new"} onOpenChange={closeDialogs}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register for Daycare</DialogTitle>
                        <DialogDescription>Add a student to today's daycare schedule.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Student</label>
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Search or select student..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((student) => (
                                        <SelectItem key={student.id} value={student.id.toString()}>
                                            {student.full_name} ({student.enrollment_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
                        <Button onClick={createRecord} disabled={!selectedStudent}>Create Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogType === "meal"} onOpenChange={closeDialogs}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Meal</DialogTitle>
                        <DialogDescription>Add details regarding {activeRecord?.child_name}&apos;s meal.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Meal Notes</label>
                            <Textarea
                                placeholder="A bien mangé..."
                                value={mealNotes}
                                onChange={(e) => setMealNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
                        <Button onClick={submitMeal}>Save Meal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogType === "nap"} onOpenChange={closeDialogs}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Nap</DialogTitle>
                        <DialogDescription>Track sleep time for {activeRecord?.child_name}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Time</label>
                            <Input
                                type="time"
                                value={napStart}
                                onChange={(e) => setNapStart(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Time</label>
                            <Input
                                type="time"
                                value={napEnd}
                                onChange={(e) => setNapEnd(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
                        <Button onClick={submitNap}>Save Nap</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogType === "activity"} onOpenChange={closeDialogs}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Activity</DialogTitle>
                        <DialogDescription>Record an activity for {activeRecord?.child_name}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Session</label>
                            <Select value={selectedSession} onValueChange={setSelectedSession}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select session" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning</SelectItem>
                                    <SelectItem value="afternoon">Afternoon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Activity</label>
                            <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select activity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activities.map((act) => (
                                        <SelectItem key={act.id} value={act.id.toString()}>{act.name} ({act.session})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
                        <Button onClick={submitActivity}>Save Activity</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogType === "report"} onOpenChange={closeDialogs}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Report</DialogTitle>
                        <DialogDescription>Manually generate or regenerate the daily summary report.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
                        <Button onClick={generateReport}>Generate Now</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
