"use client";
import StudentsTable from "@/components/students/students-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { useState } from "react";
import { useAcademicYears, useClassRooms } from "@/hooks/use-academic-data";
import Link from "next/link";

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState<number | undefined>();
  const [classroom, setClassroom] = useState<number | undefined>();

  const { data: studentsResponse, isLoading, error } = useStudents({
    page,
    search: search || undefined,
    academic_year: academicYear,
    class_room: classroom,
  });

  const { data: years = [] } = useAcademicYears();
  const { data: classes = [] } = useClassRooms();

  const students = studentsResponse?.results || [];
  const totalCount = studentsResponse?.count || 0;

  return (
    <div className=" mx-auto py-10 px-4 ">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Student List</CardTitle>
          </div>
          <Link href="/dashboard/students/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Student
            </Button>
          </Link>
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