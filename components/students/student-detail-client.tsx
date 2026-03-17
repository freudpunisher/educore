"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  ClipboardCheck,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react"

interface StudentDetailClientProps {
  student: any
  studentGrades: any[]
  studentAttendance: any[]
  studentInvoices: any[]
  attendanceRate: number
  averageGrade: string
  totalDue: number
  totalPaid: number
  paymentStatus: string
}

export function StudentDetailClient({
  student,
  studentGrades,
  studentAttendance,
  studentInvoices,
  attendanceRate,
  averageGrade,
  totalDue,
  totalPaid,
  paymentStatus,
}: StudentDetailClientProps) {
  const router = useRouter()

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/dashboard/students")} className="hover:bg-primary/10 text-primary font-bold rounded-xl px-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-primary/20 text-primary font-bold">
            <Mail className="w-4 h-4 mr-2" />
            Contact Parent
          </Button>
          <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="border-none shadow-2xl shadow-primary/5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden rounded-[2rem]">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-background/20 backdrop-blur-md rounded-[2.5rem] border-4 border-background/30 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-xl">
                {student.photo ? (
                  <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-background/60" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground p-2 rounded-xl shadow-lg shadow-accent/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-4xl font-heading font-bold tracking-tight">
                  {student.firstName} {student.lastName}
                </h1>
                <Badge className="w-fit mx-auto md:mx-0 bg-background/20 backdrop-blur-md text-background border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                  Matriculé #{student.id.padStart(4, '0')}
                </Badge>
              </div>
              <p className="text-xl font-medium text-background/80">
                Class of <span className="font-bold text-background">{student.class}</span> • Discovery School Burundi
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 bg-background/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  {student.address}
                </div>
                <div className="flex items-center gap-2 bg-background/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Enrolled: {new Date(student.enrollmentDate).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-auto">
              <div className="bg-background/10 p-4 rounded-2xl text-center backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold tracking-widest text-background/60">Attendance</p>
                <p className="text-2xl font-heading font-bold">{attendanceRate}%</p>
              </div>
              <div className="bg-background/10 p-4 rounded-2xl text-center backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold tracking-widest text-background/60">Avg. Grade</p>
                <p className="text-2xl font-heading font-bold">{averageGrade}/20</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Left Column: Detailed Info */}
        <div className="md:col-span-2 space-y-10">
          <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem]">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl">Academic Experience</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Tabs defaultValue="attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50 p-1.5 rounded-2xl mb-8">
                  <TabsTrigger value="attendance" className="rounded-xl font-bold uppercase tracking-wider text-xs flex gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Attendance
                  </TabsTrigger>
                  <TabsTrigger value="grades" className="rounded-xl font-bold uppercase tracking-wider text-xs flex gap-2">
                    <BookOpen className="w-4 h-4" /> Performance
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="rounded-xl font-bold uppercase tracking-wider text-xs flex gap-2">
                    <DollarSign className="w-4 h-4" /> Financials
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="attendance" className="animate-in fade-in duration-500">
                  <div className="overflow-hidden rounded-2xl border border-border/50">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted text-muted-foreground">
                          <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Session Date</th>
                          <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Status</th>
                          <th className="px-6 py-4 text-left font-bold uppercase tracking-widest text-[10px]">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {studentAttendance.length > 0 ? (
                          studentAttendance.map((record) => (
                            <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 text-sm font-bold text-foreground/80">{new Date(record.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {record.status === "present" && (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold rounded-lg px-3 py-1">Present</Badge>
                                  )}
                                  {record.status === "absent" && (
                                    <Badge className="bg-rose-500/10 text-rose-600 border-none font-bold rounded-lg px-3 py-1">Absent</Badge>
                                  )}
                                  {record.status === "late" && (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold rounded-lg px-3 py-1">Late</Badge>
                                  )}
                                  {record.status === "excused" && (
                                    <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold rounded-lg px-3 py-1">Excused</Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-muted-foreground italic">{record.notes || "No remarks"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground font-medium">No activity recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="grades" className="animate-in fade-in duration-500">
                  <div className="grid gap-4">
                    {studentGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-6 bg-muted/20 rounded-[1.5rem] border border-transparent hover:border-primary/20 hover:bg-background shadow-sm transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-foreground/90">{grade.course}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{grade.type} • {new Date(grade.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-heading font-extrabold ${(grade.grade / grade.maxGrade) * 20 >= 16 ? "text-emerald-600" : "text-primary"}`}>
                            {grade.grade}<span className="text-sm text-muted-foreground font-medium ml-1">/ {grade.maxGrade}</span>
                          </p>
                          <div className="mt-1 flex items-center gap-1 justify-end">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Above Avg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="animate-in fade-in duration-500">
                  <div className="space-y-4">
                    {studentInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-muted/20 rounded-[1.5rem] border border-transparent hover:border-primary/20 hover:bg-background transition-all gap-4">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'} rounded-2xl flex items-center justify-center`}>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground/90">{invoice.description}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-8">
                          <div className="text-right">
                            <p className="text-xl font-heading font-bold">{invoice.amount}€</p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground/40">{invoice.id}</p>
                          </div>
                          <Badge variant={invoice.status === "paid" ? "default" : "destructive"} className="rounded-xl px-4 py-1.5 font-bold shadow-sm">
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-background border border-border/10 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                Guardians
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="group p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Primary Parent</p>
                <p className="font-bold text-lg text-foreground/90">{student.parentName}</p>
                <div className="mt-4 flex flex-col gap-3">
                  <a href={`tel:${student.parentPhone}`} className="flex items-center gap-3 text-sm font-medium text-primary hover:underline">
                    <Phone className="w-4 h-4" /> {student.parentPhone}
                  </a>
                  <a href={`mailto:${student.parentEmail}`} className="flex items-center gap-3 text-sm font-medium text-primary hover:underline">
                    <Mail className="w-4 h-4 text-primary/60" /> {student.parentEmail}
                  </a>
                </div>
              </div>
              <Separator className="bg-border/30" />
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Emergency Policy</p>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Call primary guardian first. If unreachable, refer to institutional medical directory.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-primary/5 rounded-[2rem] bg-muted/10">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="relative border-l-2 border-primary/20 pl-6 ml-2 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm" />
                  <p className="text-xs font-bold text-primary uppercase mb-1">June 2024</p>
                  <p className="text-sm font-bold text-foreground/80">Term Finished</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Promoted to next grade with honors.</p>
                </div>
                <div className="relative opacity-50">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-muted border-4 border-background" />
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Sept 2023</p>
                  <p className="text-sm font-bold text-foreground/80">Enrollment</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Joined Discovery School.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
