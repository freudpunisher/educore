"use client";
import StudentsTable  from "@/components/students/students-table";
import { CreateStudentDialog } from "@/components/students/create-student-dialog";
import { Card, CardContent,  CardHeader,  CardTitle } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import { useStudents } from "@/hooks/use-students";



export default function StudentsPage() {
  const { data: students = [], isLoading, error } = useStudents();

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Liste des élèves</CardTitle>
          </div>
          <CreateStudentDialog />
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-center text-destructive py-10">
              Impossible de charger les élèves.
            </p>
          ) : (
            <StudentsTable students={students} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}