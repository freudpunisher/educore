import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { mockStudents, mockGrades, mockAttendance, mockInvoices } from "@/lib/mock-data"
import { StudentDetailClient } from "@/components/students/student-detail-client"

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = mockStudents.find((s) => s.id === id)

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-2">Student not found</h2>
        <p className="text-muted-foreground mb-4">The student you are looking for does not exist.</p>
        <Link href="/dashboard/students">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </Button>
        </Link>
      </div>
    )
  }

  const studentGrades = mockGrades.filter((g) => g.studentId === id)
  const studentAttendance = mockAttendance.filter((a) => a.studentId === id)
  const studentInvoices = mockInvoices.filter((i) => i.studentId === id)

  // Calculate statistics
  const totalAttendance = studentAttendance.length
  const presentCount = studentAttendance.filter((a) => a.status === "present").length
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  const averageGrade =
    studentGrades.length > 0
      ? (studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 20, 0) / studentGrades.length).toFixed(1)
      : "N/A"

  const totalDue = studentInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = studentInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
  const paymentStatus = totalDue === totalPaid ? "paid" : totalPaid > 0 ? "partial" : "unpaid"

  return (
    <StudentDetailClient
      student={student}
      studentGrades={studentGrades}
      studentAttendance={studentAttendance}
      studentInvoices={studentInvoices}
      attendanceRate={attendanceRate}
      averageGrade={averageGrade}
      totalDue={totalDue}
      totalPaid={totalPaid}
      paymentStatus={paymentStatus}
    />
  )
}
