// app/dashboard/attendance/[id]/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserCheck, UserX, AlertCircle, CalendarDays, Clock, School, FileText, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useAttendanceSessionDetail } from "@/hooks/use-attendance-sessions";
import { useStudents } from "@/hooks/use-students";
import { useEffect } from "react";

type Status = "present" | "absent" | "justified";

interface Student {
  id: number;
  full_name: string;
  status: Status;
  justification?: string;
}

// MOCK DATA — Fixed syntax
const mockSession = {
  id: 123,
  date: new Date(),
  start_time: "08:00",
  end_time: "10:00",
  classroom_name: "6ème A",
  subject: "Mathématiques",
};

const mockStudents: Student[] = [
  { id: 1, full_name: "MUGISHA Freud", status: "present" },
  { id: 2, full_name: "DUPONT Marie", status: "present" },
  { id: 3, full_name: "KAYEMBE Joel", status: "absent", justification: "Malade" },
  { id: 4, full_name: "NSANZIMFURA Aline", status: "present" },
  { id: 5, full_name: "IRAKOZE David", status: "justified", justification: "Permission familiale" },
  { id: 6, full_name: "UWASE Chantal", status: "present" },
  { id: 7, full_name: "NIYONSABA Patrick", status: "absent" },
  { id: 8, full_name: "MUKASA Sarah", status: "present" },
  { id: 9, full_name: "HABIMANA Jean", status: "justified", justification: "RDV médical" },
  { id: 10, full_name: "UMUTONI Grace", status: "present" },
];

export default function TakeAttendancePage() {
  const { id } = useParams();
  const { data: session, isLoading: sessionLoading } = useAttendanceSessionDetail(id as string);

  // Use session.classroom_name as class_level as requested
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    class_level: session?.classroom_name
  });

  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, { status: Status; justification?: string }>>({});
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [justification, setJustification] = useState("");

  const apiStudents = studentsData?.results || [];

  // Initialize attendance records when students load
  useEffect(() => {
    if (apiStudents.length > 0 && Object.keys(attendanceRecords).length === 0) {
      const initial: Record<number, { status: Status }> = {};
      apiStudents.forEach((s) => {
        initial[s.id] = { status: "present" };
      });
      setAttendanceRecords(initial);
    }
  }, [apiStudents]);

  const filtered = apiStudents.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    present: Object.values(attendanceRecords).filter((r) => r.status === "present").length,
    absent: Object.values(attendanceRecords).filter((r) => r.status === "absent").length,
    justified: Object.values(attendanceRecords).filter((r) => r.status === "justified").length,
  };

  const updateStatus = (studentId: number, newStatus: Status, justification?: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: { status: newStatus, justification }
    }));

    const messages: Record<Status, string> = {
      present: "Présent",
      absent: "Absent sans justification",
      justified: justification ? `Justifié : ${justification}` : "Justifié",
    };

    toast.success(messages[newStatus], { duration: 2000 });
  };

  if (sessionLoading || studentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground animate-pulse">Chargement de la séance et des élèves...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Séance introuvable</h2>
        <p className="text-muted-foreground mt-2">Nous ne parvenons pas à trouver les détails de cette séance.</p>
        <Button onClick={() => window.history.back()} className="mt-6">Retour</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-10 shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div>
                <CardTitle className="text-4xl font-bold flex items-center gap-4">
                  <School className="w-10 h-10" />
                  Prise de présence
                </CardTitle>
                <div className="mt-6 space-y-3">
                  <p className="text-2xl font-bold opacity-95">
                    {session.classroom_name} • {session.subject || "No Subject"}
                  </p>
                  <div className="flex flex-wrap gap-6 text-lg">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      {format(new Date(session.date), "EEEE dd MMMM yyyy", { locale: fr })}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {session.start_time} – {session.end_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur rounded-2xl p-5 text-center">
                  <UserCheck className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-4xl font-bold">{stats.present}</p>
                  <p className="text-sm opacity-90">Présents</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-2xl p-5 text-center">
                  <UserX className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-4xl font-bold">{stats.absent}</p>
                  <p className="text-sm opacity-90">Absents</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-2xl p-5 text-center">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-4xl font-bold">{stats.justified}</p>
                  <p className="text-sm opacity-90">Justifiés</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            placeholder="Rechercher un élève..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-16 h-16 text-lg rounded-3xl shadow-xl"
          />
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((student) => {
            const record = attendanceRecords[student.id];
            const status = record?.status || "present";
            const currentJustification = record?.justification;

            return (
              <Card
                key={student.id}
                className={`cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-4 ${status === "present"
                  ? "border-green-500 bg-green-50 dark:bg-green-950/40"
                  : status === "justified"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40"
                    : "border-red-500 bg-red-50 dark:bg-red-950/40"
                  }`}
              >
                <CardContent className="p-8 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-5 ring-8 ring-white dark:ring-gray-900">
                    <AvatarFallback
                      className={`text-3xl font-bold ${status === "present"
                        ? "bg-green-600 text-white"
                        : status === "justified"
                          ? "bg-amber-600 text-white"
                          : "bg-red-600 text-white"
                        }`}
                    >
                      {student.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-bold text-xl mb-4">{student.full_name}</h3>

                  {/* Status Display */}
                  {status === "present" && (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">Présent</span>
                    </div>
                  )}
                  {status === "absent" && (
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="w-12 h-12 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">Absent</span>
                    </div>
                  )}
                  {status === "justified" && (
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-amber-600" />
                      <span className="text-2xl font-bold text-amber-600">Justifié</span>
                      {currentJustification && (
                        <p className="text-sm text-amber-700 mt-1">{currentJustification}</p>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-6 flex justify-center gap-3">
                    <Button
                      size="sm"
                      variant={status === "present" ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(student.id, "present");
                      }}
                    >
                      Présent
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "absent" ? "destructive" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(student.id, "absent");
                      }}
                    >
                      Absent
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant={status === "justified" ? "default" : "outline"}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Justifier l'absence de {student.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Select value={justification} onValueChange={setJustification}>
                            <SelectTrigger>
                              <SelectValue placeholder="Motif de l'absence" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Malade">Malade</SelectItem>
                              <SelectItem value="Permission familiale">Permission familiale</SelectItem>
                              <SelectItem value="RDV médical">RDV médical</SelectItem>
                              <SelectItem value="Problème de transport">Problème de transport</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setJustification("")}>
                              Annuler
                            </Button>
                            <Button
                              onClick={() => {
                                updateStatus(student.id, "justified", justification || "Justifié");
                                setJustification("");
                              }}
                            >
                              Valider
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Finish Button */}
        <div className="fixed bottom-10 right-10">
          <Button size="lg" className="shadow-2xl text-xl px-12 py-8 rounded-3xl">
            Terminer la séance
          </Button>
        </div>
      </div>
    </div>
  );
}