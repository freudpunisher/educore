"use client"

import { useState, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    ArrowLeft,
    GraduationCap,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Users,
    Plus,
    Save,
    CheckCircle2,
    AlertCircle,
    User,
    Edit,
    Clock
} from "lucide-react"
import { mockTeachers, mockStudents, mockGrades, mockCourses } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const teacher = mockTeachers.find((t) => t.id === id)

    if (!teacher) {
        notFound()
    }

    const [selectedClass, setSelectedClass] = useState<string>("")
    const [selectedCourse, setSelectedCourse] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Filter students for the selected class
    const classStudents = selectedClass
        ? mockStudents.filter(s => s.class === selectedClass)
        : []

    // Component for the Grading Interface
    const GradingInterface = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-3xl border border-border/40 transition-all hover:bg-muted/30">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Target Class</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="h-14 bg-background border-none shadow-sm rounded-2xl font-bold text-lg focus:ring-primary/20 transition-all">
                            <Users className="w-5 h-5 mr-3 text-primary" />
                            <SelectValue placeholder="Identify Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/50">
                            {teacher.classes.map(cls => (
                                <SelectItem key={cls} value={cls} className="font-bold py-3">{cls}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Academic Course</label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="h-14 bg-background border-none shadow-sm rounded-2xl font-bold text-lg focus:ring-primary/20 transition-all">
                            <BookOpen className="w-5 h-5 mr-3 text-primary" />
                            <SelectValue placeholder="Identify Course" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/50">
                            {teacher.courses.map(course => (
                                <SelectItem key={course} value={course} className="font-bold py-3">{course}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedClass && selectedCourse ? (
                <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden bg-background ring-1 ring-border/5">
                    <CardHeader className="p-8 pb-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/10">
                        <div>
                            <div className="flex items-center gap-3">
                                <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-md">Live Assessment</Badge>
                                <CardTitle className="text-2xl font-heading font-bold">{selectedCourse}</CardTitle>
                            </div>
                            <CardDescription className="text-sm font-medium mt-1">Section: <span className="text-foreground font-bold">{selectedClass}</span> • Grade Entry Protocol</CardDescription>
                        </div>
                        <Button
                            className="rounded-xl font-extrabold shadow-lg shadow-primary/20 bg-primary h-12 px-8 transition-all hover:scale-105"
                            onClick={() => {
                                setIsSaving(true)
                                setTimeout(() => {
                                    setIsSaving(false)
                                    setSaveSuccess(true)
                                    setTimeout(() => setSaveSuccess(false), 3000)
                                }, 1000)
                            }}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Synchronizing...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Finalize Grades</span>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {saveSuccess && (
                            <div className="m-8 p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border border-emerald-500/20 shadow-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold text-sm">Academic records updated successfully in institutional registry.</span>
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/30">
                                    <tr className="hover:bg-transparent">
                                        <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60 w-1/3">Student Name</th>
                                        <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60 w-1/4">Evaluation (0-20)</th>
                                        <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60">Observations / Pedagogy Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/10">
                                    {classStudents.map(student => (
                                        <tr key={student.id} className="group hover:bg-muted/10 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-muted-foreground/60 text-xs">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    <span className="font-bold text-foreground/80 group-hover:text-primary transition-colors">
                                                        {student.firstName} {student.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="relative max-w-[120px]">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        placeholder="0.0"
                                                        className="h-11 bg-muted/20 border-none rounded-xl font-bold text-center focus-visible:ring-2 focus-visible:ring-primary/30"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">/20</div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Input
                                                    placeholder="Individual student progress remarks..."
                                                    className="h-11 bg-muted/20 border-none rounded-xl font-medium focus-visible:ring-2 focus-visible:ring-primary/10"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {classStudents.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-muted-foreground/20" />
                                </div>
                                <p className="font-bold text-muted-foreground/60 italic text-sm">No student records identified for this section.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/5 border-2 border-dashed border-border/40 rounded-[2.5rem] animate-pulse">
                    <AlertCircle className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-bold tracking-tight text-lg">Define Assessment Parameters</p>
                    <p className="text-sm font-medium opacity-60">Select target class and course to initialize grading registry</p>
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => window.history.back()}
                    className="hover:bg-primary/10 text-primary font-bold rounded-xl px-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Faculty Directory
                </Button>
                <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Faculty Profile
                </Button>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-8">
                    <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-background group">
                        <div className="h-24 bg-gradient-to-r from-primary to-primary/80" />
                        <CardContent className="p-8 pt-0 -mt-12 text-center flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-background p-2 shadow-xl border-4 border-background overflow-hidden relative z-10">
                                    <div className="w-full h-full bg-primary/10 rounded-3xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-500">
                                        {teacher.photo ? (
                                            <img src={teacher.photo} alt={teacher.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <GraduationCap className="w-16 h-16 text-primary group-hover:scale-110 transition-transform duration-500" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl shadow-lg border-4 border-background z-20 flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground/90">
                                    {teacher.firstName} {teacher.lastName}
                                </h2>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                                    {teacher.specialization}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                <div className="bg-muted/10 p-4 rounded-3xl text-center border border-border/5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Courses</p>
                                    <p className="text-2xl font-heading font-bold text-primary">{teacher.courses.length}</p>
                                </div>
                                <div className="bg-muted/10 p-4 rounded-3xl text-center border border-border/5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Classes</p>
                                    <p className="text-2xl font-heading font-bold text-primary">{teacher.classes.length}</p>
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                <a href={`mailto:${teacher.email}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all group/link border border-transparent hover:border-border/50">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-all">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Email Domain</p>
                                        <p className="text-sm font-bold text-foreground/80">{teacher.email}</p>
                                    </div>
                                </a>
                                <a href={`tel:${teacher.phone}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all group/link border border-transparent hover:border-border/50">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-all">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Direct Phone</p>
                                        <p className="text-sm font-bold text-foreground/80">{teacher.phone}</p>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-border/10">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Member Since</p>
                                        <p className="text-sm font-bold text-foreground/80">
                                            {new Date(teacher.joiningDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dynamic Content Columns */}
                <div className="md:col-span-2 space-y-10">
                    <Tabs defaultValue="overview" className="space-y-10">
                        <TabsList className="grid w-full grid-cols-3 h-16 bg-muted/50 p-2 rounded-[1.5rem] shadow-sm">
                            <TabsTrigger value="overview" className="rounded-xl font-bold uppercase tracking-wider text-xs flex gap-2 transition-all">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="grading" className="rounded-xl font-bold uppercase tracking-wider text-xs flex gap-2 transition-all">
                                Grading Registry
                            </TabsTrigger>
                            <TabsTrigger value="schedule" className="rounded-xl font-bold uppercase tracking-wider text-xs flex gap-2 transition-all">
                                Faculty Schedule
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="grid gap-8 md:grid-cols-2">
                                <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-background border border-border/10">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-xl flex items-center gap-3">
                                            <Users className="w-6 h-6 text-primary" />
                                            Assigned Sections
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 flex flex-wrap gap-2">
                                        {teacher.classes.map(cls => (
                                            <Badge key={cls} className="bg-primary/10 text-primary border-none font-bold text-sm px-4 py-2 rounded-xl">
                                                {cls}
                                            </Badge>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-background border border-border/10">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-xl flex items-center gap-3">
                                            <BookOpen className="w-6 h-6 text-primary" />
                                            Courses Syllabus
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 flex flex-wrap gap-2">
                                        {teacher.courses.map(course => (
                                            <Badge key={course} variant="outline" className="border-primary/20 text-foreground/70 font-bold text-sm px-4 py-2 rounded-xl">
                                                {course}
                                            </Badge>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-background mt-8 overflow-hidden border border-border/10">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl">Academic Activity Feed</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-5 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/40 group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-all">
                                                    <CheckCircle2 className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground/90 group-hover:text-primary transition-colors">Graded Mathematics Assessment</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Section 5th A • Archive #0342</p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-extrabold text-muted-foreground/30 uppercase tracking-tighter">{i}h ago</span>
                                        </div>
                                    ))}
                                    <Button variant="ghost" className="w-full h-12 text-primary font-bold hover:bg-primary/5 rounded-xl">
                                        Access Detailed Logs
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="grading">
                            <GradingInterface />
                        </TabsContent>

                        <TabsContent value="schedule">
                            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-muted/5 border-2 border-dashed border-border/40 rounded-[2.5rem]">
                                <Calendar className="w-20 h-20 mb-6 opacity-10" />
                                <h3 className="text-xl font-bold text-foreground/60">Institutional Timetable</h3>
                                <p className="text-sm font-medium opacity-60 mt-2">Faculty weekly schedule is currently being synchronized.</p>
                                <Button variant="outline" className="mt-8 rounded-xl font-bold h-12 px-8 border-primary/20 text-primary">
                                    Request Manual Schedule
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
