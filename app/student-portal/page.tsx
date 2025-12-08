"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle2, XCircle, Clock, AlertCircle, DollarSign, TrendingUp } from "lucide-react"
import { mockStudents, mockGrades, mockAttendance, mockInvoices, mockTimetable } from "@/lib/mock-data"

export default function StudentPortalPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) return null

  // For demo purposes, we'll use the first student's data
  // In a real app, this would be linked to the logged-in student
  const student = mockStudents[0]
  const studentGrades = mockGrades.filter((g) => g.studentId === student.id)
  const studentAttendance = mockAttendance.filter((a) => a.studentId === student.id)
  const studentInvoices = mockInvoices.filter((i) => i.studentId === student.id)
  const studentTimetable = mockTimetable.filter((t) => t.class === student.class)

  // Calculate statistics
  const totalAttendance = studentAttendance.length
  const presentCount = studentAttendance.filter((a) => a.status === "present").length
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  const averageGrade =
    studentGrades.length > 0
      ? (studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 20, 0) / studentGrades.length).toFixed(1)
      : "0"

  const totalDue = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = studentInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
  const paymentStatus = totalDue === totalPaid ? "paid" : totalPaid > 0 ? "partial" : "unpaid"

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Bonjour, {student.firstName} {student.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">Classe: {student.class}</p>
          </div>
          <Badge variant="default" className="text-base px-4 py-2">
            Élève
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageGrade}/20</div>
              <p className="text-xs text-muted-foreground mt-1">
                {Number.parseFloat(averageGrade) >= 16
                  ? "Excellent travail!"
                  : Number.parseFloat(averageGrade) >= 10
                    ? "Bon travail"
                    : "Continue tes efforts"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Présence</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{presentCount} jours présents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes Récentes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentGrades.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Évaluations ce trimestre</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frais Scolaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentStatus === "paid" ? (
                  <span className="text-green-600">Payé</span>
                ) : (
                  <span className="text-orange-600">{totalDue - totalPaid}€</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {paymentStatus === "paid" ? "Tous les frais réglés" : "Reste à payer"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Mon Espace Élève</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grades" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="grades">Mes Notes</TabsTrigger>
                <TabsTrigger value="attendance">Ma Présence</TabsTrigger>
                <TabsTrigger value="timetable">Emploi du Temps</TabsTrigger>
                <TabsTrigger value="payments">Paiements</TabsTrigger>
              </TabsList>

              <TabsContent value="grades" className="space-y-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Matière</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Note</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentGrades.map((grade) => (
                          <tr key={grade.id} className="border-b">
                            <td className="px-4 py-3 text-sm font-medium">{grade.course}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-sm font-semibold ${
                                  (grade.grade / grade.maxGrade) * 20 >= 16
                                    ? "text-green-600"
                                    : (grade.grade / grade.maxGrade) * 20 >= 10
                                      ? "text-blue-600"
                                      : "text-red-600"
                                }`}
                              >
                                {grade.grade}/{grade.maxGrade} ({((grade.grade / grade.maxGrade) * 20).toFixed(1)}/20)
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">
                                {grade.type === "exam" ? "Examen" : grade.type === "homework" ? "Devoir" : "Contrôle"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(grade.date).toLocaleDateString("fr-FR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentAttendance.map((record) => (
                          <tr key={record.id} className="border-b">
                            <td className="px-4 py-3 text-sm">{new Date(record.date).toLocaleDateString("fr-FR")}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {record.status === "present" && (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600">Présent</span>
                                  </>
                                )}
                                {record.status === "absent" && (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-600">Absent</span>
                                  </>
                                )}
                                {record.status === "late" && (
                                  <>
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm text-orange-600">Retard</span>
                                  </>
                                )}
                                {record.status === "excused" && (
                                  <>
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-600">Excusé</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{record.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timetable" className="space-y-4">
                <div className="grid gap-4">
                  {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((day) => {
                    const daySlots = studentTimetable.filter((slot) => slot.day === day)
                    return (
                      <Card key={day}>
                        <CardHeader>
                          <CardTitle className="text-lg">{day}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {daySlots.length > 0 ? (
                              daySlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium text-muted-foreground">
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                    <div className="h-8 w-1 bg-primary rounded" />
                                    <div>
                                      <div className="font-medium">{slot.subject}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {slot.teacher} • {slot.room}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">Pas de cours ce jour</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Montant</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Échéance</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentInvoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b">
                            <td className="px-4 py-3 text-sm">{invoice.description}</td>
                            <td className="px-4 py-3 text-sm font-semibold">{invoice.amount}€</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  invoice.status === "paid"
                                    ? "default"
                                    : invoice.status === "overdue"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {invoice.status === "paid"
                                  ? "Payé"
                                  : invoice.status === "overdue"
                                    ? "En retard"
                                    : "En attente"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
