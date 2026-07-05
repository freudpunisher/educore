"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEnrollments, useTerms, useTermReportCard, useYearReportCard, useClassRanking } from "@/hooks/use-pedagogy"
import { useAcademicYears, useClassRooms } from "@/hooks/use-academic-data"
import { Loader2, FileText, GraduationCap, Trophy, AlertCircle } from "lucide-react"

export default function ReportCardPage() {
  const { data: yearsData } = useAcademicYears()
  const { data: classrooms = [] } = useClassRooms()

  const [selectedYearId, setSelectedYearId] = useState<number | undefined>(undefined)
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined)
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined)
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"term" | "year">("term")

  const academicYears = yearsData || []
  const { data: terms = [] } = useTerms(selectedYearId)
  const { data: enrollmentsData } = useEnrollments(selectedClassId, selectedYearId)
  const enrollments = enrollmentsData?.results || []

  const { data: termReport, isLoading: loadingTerm } = useTermReportCard(selectedEnrollmentId, selectedTermId)
  const { data: yearReport, isLoading: loadingYear } = useYearReportCard(selectedEnrollmentId)
  const { data: rankingData, isLoading: loadingRanking } = useClassRanking(selectedClassId, selectedTermId)

  const reportData = viewMode === "term" ? termReport : yearReport
  const isLoading = viewMode === "term" ? loadingTerm : loadingYear

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Report Cards
        </h1>
        <div className="flex gap-2">
          <Button variant={viewMode === "term" ? "default" : "outline"} size="sm" onClick={() => setViewMode("term")}>
            Term Report
          </Button>
          <Button variant={viewMode === "year" ? "default" : "outline"} size="sm" onClick={() => setViewMode("year")}>
            Annual Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4">
          <Select onValueChange={(v) => setSelectedYearId(parseInt(v))} value={selectedYearId?.toString()}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Academic Year" /></SelectTrigger>
            <SelectContent>
              {academicYears.map((y: any) => (
                <SelectItem key={y.id} value={y.id.toString()}>{y.name || `${y.start_year}-${y.end_year}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setSelectedClassId(parseInt(v))} value={selectedClassId?.toString()}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Class Room" /></SelectTrigger>
            <SelectContent>
              {classrooms.map((c: any) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {viewMode === "term" && (
            <Select onValueChange={(v) => setSelectedTermId(parseInt(v))} value={selectedTermId?.toString()}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Term" /></SelectTrigger>
              <SelectContent>
                {terms.map((t: any) => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select onValueChange={(v) => setSelectedEnrollmentId(parseInt(v))} value={selectedEnrollmentId?.toString()}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Student" /></SelectTrigger>
            <SelectContent>
              {enrollments.map((e: any) => (
                <SelectItem key={e.id} value={e.id.toString()}>{e.student_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Report */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                {reportData.student?.name} — {viewMode === "term" ? reportData.term?.name : `Annual Report ${reportData.academic_year || ''}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportData.summary?.overall_percentage !== undefined && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{reportData.summary.overall_percentage.toFixed(1)}%</p>
                    <Badge variant="outline">{reportData.summary.letter_grade || '-'}</Badge>
                  </div>
                )}
                {reportData.summary?.gpa?.term !== undefined && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Term GPA</p>
                    <p className="text-2xl font-bold">{reportData.summary.gpa.term.toFixed(2)}</p>
                  </div>
                )}
                {reportData.summary?.gpa?.cumulative !== undefined && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Cumulative GPA</p>
                    <p className="text-2xl font-bold">{reportData.summary.gpa.cumulative.toFixed(2)}</p>
                  </div>
                )}
                {rankingData?.rankings && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Rank</p>
                    <p className="text-2xl font-bold">
                      {rankingData.rankings.find((r: any) => r.enrollment_id === selectedEnrollmentId)?.rank || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">in class</p>
                  </div>
                )}
              </div>

              {reportData.attendance && (
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span>Absences: <strong className="text-foreground">{reportData.attendance.absences}</strong></span>
                  <span>Lates: <strong className="text-foreground">{reportData.attendance.lates}</strong></span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Subject Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    {reportData.subjects && reportData.subjects[Object.keys(reportData.subjects)[0]]?.categories && (
                      Object.entries(reportData.subjects[Object.keys(reportData.subjects)[0]].categories || {}).map(([key, cat]: any) => (
                        <TableHead key={key} className="text-center text-xs">{cat.label}</TableHead>
                      ))
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.subjects && Object.entries(reportData.subjects).map(([name, subject]: any) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-center">
                        {subject.points_earned !== undefined ? `${subject.points_earned}/${subject.points_max}` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={subject.average < 50 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                          {subject.average.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={subject.letter === "F" ? "destructive" : "outline"}>{subject.letter || '-'}</Badge>
                      </TableCell>
                      {subject.categories && Object.entries(subject.categories).map(([key, cat]: any) => (
                        <TableCell key={key} className="text-center text-sm">
                          {cat.points_earned}/{cat.points_max}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Terms (annual view) */}
          {reportData.terms && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Term Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">GPA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.terms.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-center">{t.percentage?.toFixed(1)}%</TableCell>
                        <TableCell className="text-center">{t.gpa?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Select filters above to view a report card.</p>
        </div>
      )}
    </div>
  )
}
