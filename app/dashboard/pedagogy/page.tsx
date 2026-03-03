"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BookOpen, GraduationCap, Calendar } from "lucide-react"
import { mockClasses, mockCourses, mockGrades } from "@/lib/mock-data"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const gradeDistribution = [
  { range: "0-5", count: 2 },
  { range: "6-10", count: 8 },
  { range: "11-15", count: 25 },
  { range: "16-20", count: 15 },
]

export default function PedagogyPage() {
  const totalClasses = mockClasses.length
  const totalCourses = mockCourses.length
  const totalStudents = mockClasses.reduce((sum, cls) => sum + cls.studentCount, 0)
  const averageGrade = (
    mockGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 20, 0) / mockGrades.length
  ).toFixed(1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedagogy</h1>
          <p className="text-muted-foreground mt-1">Manage classes, courses, and student grades</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalStudents} students total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">All levels combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">General Average</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <GraduationCap className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade}/20</div>
            <p className="text-xs text-muted-foreground mt-1">All subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evaluations</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGrades.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tables */}
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Class List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Main Teacher</TableHead>
                      <TableHead>No. of Students</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{cls.level}</Badge>
                        </TableCell>
                        <TableCell>{cls.teacher}</TableCell>
                        <TableCell>{cls.studentCount}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{cls.schedule}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.teacher}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.class}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{course.schedule}</TableCell>
                        <TableCell>{course.room}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.studentName}</TableCell>
                        <TableCell>{grade.course}</TableCell>
                        <TableCell>
                          <span className="font-bold">
                            {grade.grade}/{grade.maxGrade}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              grade.type === "exam" ? "default" : grade.type === "quiz" ? "secondary" : "outline"
                            }
                          >
                            {grade.type === "exam" ? "Exam" : grade.type === "quiz" ? "Quiz" : "Homework"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(grade.date).toLocaleDateString("en-US")}</TableCell>
                      </TableRow>
                    ))}
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
