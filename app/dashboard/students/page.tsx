"use client";
import StudentsTable from "@/components/students/students-table";
import ParentsTable from "@/components/parents/parents-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Plus, UserCheck, UserMinus, GraduationCap, Heart } from "lucide-react";
import { useStudents, useStudentStats } from "@/hooks/use-students";
import { useParents } from "@/hooks/use-parents";
import { useState } from "react";
import { useAcademicYears, useClassRooms } from "@/hooks/use-academic-data";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { KpiGrid, KpiCardData } from "@/components/dashboard/kpi-grid";

export default function StudentsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("students");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState<number | undefined>();
  const [classroom, setClassroom] = useState<number | undefined>();
  const [gender, setGender] = useState<number | undefined>();
  const [parentPage, setParentPage] = useState(1);
  const [parentSearch, setParentSearch] = useState("");

  const onAcademicYearChange = (id?: number) => { setAcademicYear(id); setPage(1); };
  const onClassroomChange = (id?: number) => { setClassroom(id); setPage(1); };
  const onGenderChange = (gender?: number) => { setGender(gender); setPage(1); };
  const onSearchChange = (search: string) => { setSearch(search); setPage(1); };

  const { data: studentsResponse, isLoading, error } = useStudents({
    page,
    page_size: 10,
    search: search || undefined,
    academic_year: academicYear,
    classroom: classroom,
    gender,
  });

  const { data: parentsResponse, isLoading: parentsLoading, error: parentsError } = useParents({
    page: parentPage,
    page_size: 10,
    search: parentSearch || undefined,
  });

  const { data: years = [] } = useAcademicYears();
  const { data: classes = [] } = useClassRooms();
  const { data: stats, isLoading: statsLoading } = useStudentStats();

  const students = studentsResponse?.results || [];
  const totalCount = studentsResponse?.count || 0;
  const parents = parentsResponse?.results || [];
  const parentsTotal = parentsResponse?.count || 0;

  const kpiCards: KpiCardData[] = [
    {
      title: "Total Enrolled",
      value: stats?.total_enrolled ?? null,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active / Inactive",
      value: stats?.active ?? null,
      sub: `${stats?.inactive ?? 0} inactive`,
      icon: <UserCheck className="w-5 h-5 text-green-600" />,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Male / Female",
      value: stats?.male ?? null,
      sub: `${stats?.female ?? 0} female`,
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Abandoned",
      value: stats?.abandoned ?? null,
      icon: <UserMinus className="w-5 h-5 text-red-600" />,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="mx-auto py-10 px-4">
      <div className="mb-6">
        <KpiGrid cards={kpiCards} isLoading={statsLoading} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); setParentPage(1); }}>
            <TabsList className="h-10">
              <TabsTrigger value="students" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="parents" className="gap-2">
                <Heart className="w-4 h-4" />
                Parents / Guardians
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === "students" && user?.can?.('manage_students') && (
            <Link href="/dashboard/students/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Student
              </Button>
            </Link>
          )}
        </CardHeader>

        <CardContent>
          {tab === "students" ? (
            <StudentsTable
              students={students}
              isLoading={isLoading}
              error={!!error}
              totalCount={totalCount}
              currentPage={page}
              onPageChange={setPage}
              search={search}
              onSearchChange={onSearchChange}
              academicYear={academicYear}
              onAcademicYearChange={onAcademicYearChange}
              classroom={classroom}
              onClassroomChange={onClassroomChange}
              gender={gender}
              onGenderChange={onGenderChange}
              years={years}
              classes={classes}
              userRole={user?.role}
            />
          ) : (
            <ParentsTable
              parents={parents}
              isLoading={parentsLoading}
              error={!!parentsError}
              totalCount={parentsTotal}
              currentPage={parentPage}
              onPageChange={setParentPage}
              search={parentSearch}
              onSearchChange={setParentSearch}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}