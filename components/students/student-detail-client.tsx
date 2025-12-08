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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/dashboard/students")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {student.firstName} {student.lastName}
                </CardTitle>
                <p className="text-muted-foreground mt-1">Élève - {student.class}</p>
              </div>
              <Badge variant={student.status === "active" ? "default" : "secondary"}>
                {student.status === "active" ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Informations Personnelles</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date de Naissance</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(student.dateOfBirth).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Genre</p>
                    <p className="text-sm text-muted-foreground">{student.gender === "M" ? "Masculin" : "Féminin"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">{student.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date d'Inscription</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(student.enrollmentDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Informations du Parent</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Nom du Parent</p>
                    <p className="text-sm text-muted-foreground">{student.parentName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">{student.parentPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{student.parentEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Envoyer un Email
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Phone className="w-4 h-4 mr-2" />
                Appeler le Parent
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="w-4 h-4 mr-2" />
                Voir l'Emploi du Temps
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Statut des Paiements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total dû</span>
                <span className="font-semibold">{totalDue}€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payé</span>
                <span className="font-semibold text-green-600">{totalPaid}€</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                {paymentStatus === "paid" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Tous les frais payés</span>
                  </>
                ) : paymentStatus === "partial" ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">Paiement partiel</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Impayé</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Présence</span>
                  <span className="font-medium">{attendanceRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${attendanceRate}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Moyenne Générale</span>
                  <span className="font-medium">{averageGrade}/20</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full"
                    style={{ width: `${averageGrade !== "N/A" ? (Number.parseFloat(averageGrade) / 20) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de l'Élève</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attendance">Présence</TabsTrigger>
              <TabsTrigger value="grades">Notes</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
            </TabsList>

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
                      {studentAttendance.length > 0 ? (
                        studentAttendance.map((record) => (
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Aucun enregistrement de présence
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

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
                      {studentGrades.length > 0 ? (
                        studentGrades.map((grade) => (
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
                                {grade.grade}/{grade.maxGrade}
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Aucune note enregistrée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">Facture</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Montant</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Échéance</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentInvoices.length > 0 ? (
                        studentInvoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b">
                            <td className="px-4 py-3 text-sm font-medium">{invoice.id}</td>
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Aucune facture enregistrée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
