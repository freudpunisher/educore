"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { ExamAttendanceForm } from "@/components/attendance/exam-attendance-form";
import { useClassRooms } from "@/hooks/use-academic-data";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export default function ExamAttendancePage() {
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const [selectedAssessmentTitle, setSelectedAssessmentTitle] = useState<string>("");

  const { data: classrooms = [] } = useClassRooms();

  // Fetch assessments for selected classroom
  const { data: assessmentsData, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["assessments-for-classroom", selectedClassroom],
    queryFn: async () => {
      if (!selectedClassroom) return [];
      const { data } = await axiosInstance.get("/academics/assessments/", {
        params: { course__classroom: selectedClassroom, published: true },
      });
      const raw = data?.data?.results || data?.results || data?.data || [];
      return Array.isArray(raw) ? raw : [];
    },
    enabled: !!selectedClassroom,
  });

  const assessments = assessmentsData || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Présences aux examens</h1>
          <p className="text-muted-foreground text-sm">
            Enregistrez les présences lors des évaluations et examens
          </p>
        </div>
      </div>

      {/* Selectors */}
      <Card className="shadow-md border-0">
        <CardHeader className="border-b bg-muted/30 rounded-t-xl pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Sélectionner l'examen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-sm font-medium mb-2 block">Classe</Label>
              <Select
                onValueChange={(v) => {
                  setSelectedClassroom(Number(v));
                  setSelectedAssessment(null);
                  setSelectedAssessmentTitle("");
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Examen / Évaluation
                {selectedClassroom && (
                  <Badge variant="secondary" className="ml-2">{assessments.length}</Badge>
                )}
              </Label>
              <Select
                disabled={!selectedClassroom || assessmentsLoading}
                onValueChange={(v) => {
                  const parts = v.split("|");
                  setSelectedAssessment(Number(parts[0]));
                  setSelectedAssessmentTitle(parts[1] || "");
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue
                    placeholder={
                      assessmentsLoading
                        ? "Chargement..."
                        : !selectedClassroom
                        ? "Sélectionner une classe d'abord"
                        : assessments.length === 0
                        ? "Aucun examen disponible"
                        : "Choisir un examen"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((a: any) => (
                    <SelectItem key={a.id} value={`${a.id}|${a.title}`}>
                      <span className="flex flex-col">
                        <span className="font-medium">{a.title}</span>
                        {a.date && (
                          <span className="text-xs text-muted-foreground">{a.date}</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Form */}
      {selectedAssessment && selectedClassroom ? (
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <ExamAttendanceForm
              assessmentId={selectedAssessment}
              assessmentTitle={selectedAssessmentTitle}
              classroomId={selectedClassroom}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="text-center py-16">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="text-lg text-muted-foreground">
              {!selectedClassroom
                ? "Sélectionnez une classe pour commencer"
                : "Sélectionnez un examen pour prendre les présences"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
