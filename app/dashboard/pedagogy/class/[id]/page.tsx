"use client"

import { useClassRoom, useAcademicYears } from "@/hooks/use-academic-data"
import { useEnrollments, useCourses } from "@/hooks/use-pedagogy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, BookOpen, ChevronLeft, Calendar } from "lucide-react"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function ClassDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [selectedYear, setSelectedYear] = useState<string>("")

  const { data: years } = useAcademicYears()
  const { data: classItem, isLoading: loadingClass } = useClassRoom(id)

  const academicYearId = selectedYear && selectedYear !== "all" ? parseInt(selectedYear) : undefined

  const { data: enrollmentData, isLoading: loadingEnrollments } = useEnrollments(parseInt(id), academicYearId)
  const { data: courseData, isLoading: loadingCourses } = useCourses(parseInt(id), academicYearId)

  const enrollments = enrollmentData?.results || []
  const courses = courseData?.results || []

  if (loadingClass) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pedagogy">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{classItem?.name}</h1>
            <p className="text-muted-foreground mt-1">
              Class Code: <Badge variant="secondary">{classItem?.code}</Badge>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Academic Years" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Academic Years</SelectItem>
                    {years?.map((year: any) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                            {year.start_year}-{year.end_year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Students</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses / Sections</CardTitle>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Class Tutor</CardTitle>
            <Users className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{classItem?.tutor_name || "Unassigned"}</div>
            <p className="text-xs text-muted-foreground mt-1">Homeroom teacher</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Student Roster</TabsTrigger>
          <TabsTrigger value="courses">Active Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Students List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEnrollments ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : enrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No students enrolled in this class.
                        </TableCell>
                      </TableRow>
                    ) : (
                      enrollments.map((enr: any) => (
                        <TableRow key={enr.id}>
                          <TableCell className="font-medium">{enr.student_name}</TableCell>
                          <TableCell>{new Date(enr.date_enrolled).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCourses ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : courses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No courses assigned to this class.
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map((course: any) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>{course.teacher_name || "Unassigned"}</TableCell>
                          <TableCell>
                            {course.credits ? (
                              <Badge variant="secondary">{course.credits} Credits</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
