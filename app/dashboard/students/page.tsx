"use client";
import StudentsTable from "@/components/students/students-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, UserCheck, UserMinus } from "lucide-react";
import { useStudents, useStudentStats } from "@/hooks/use-students";
import { useState, useEffect } from "react";
import { useAcademicYears, useClassRooms } from "@/hooks/use-academic-data";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { KpiGrid, KpiCardData } from "@/components/dashboard/kpi-grid";

export default function StudentsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState<number | undefined>();
  const [classroom, setClassroom] = useState<number | undefined>();

  const { data: studentsResponse, isLoading, error } = useStudents({
    page,
    search: search || undefined,
    academic_year: academicYear,
    classroom: classroom,
  });

  const { data: years = [] } = useAcademicYears();
  const { data: classes = [] } = useClassRooms();
  const { data: stats, isLoading: statsLoading } = useStudentStats();

  useEffect(() => {
    if (years.length > 0 && academicYear === undefined) {
      const current = years.find((y: any) => y.is_current);
      if (current) setAcademicYear(current.id);
      else setAcademicYear(years[0].id);
    }
  }, [years, academicYear]);

  const students = studentsResponse?.results || [];
  const totalCount = studentsResponse?.count || 0;

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
    <div className=" mx-auto py-10 px-4 ">
      <div className="mb-6">
        <KpiGrid cards={kpiCards} isLoading={statsLoading} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Student List</CardTitle>
          </div>
          {user?.can?.('users.manage') && (
            <Link href="/dashboard/students/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Student
              </Button>
            </Link>
          )}
        </CardHeader>

        <CardContent>
          <StudentsTable
            students={students}
            isLoading={isLoading}
            error={!!error}
            totalCount={totalCount}
            currentPage={page}
            onPageChange={setPage}
            search={search}
            onSearchChange={setSearch}
            academicYear={academicYear}
            onAcademicYearChange={setAcademicYear}
            classroom={classroom}
            onClassroomChange={setClassroom}
            years={years}
            classes={classes}
          />
        </CardContent>
      </Card>
    </div>
  );
}