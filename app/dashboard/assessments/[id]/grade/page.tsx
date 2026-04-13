// app/dashboard/assessments/[id]/grade/page.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy, Save, Calculator, MessageSquare, Users } from "lucide-react";

// MOCK TEST DATA
const testInfo = {
  id: 1,
  title: "Devoir de Mathématiques - Chapitre 3",
  date: new Date("2025-04-02"),
  maxPoints: 20,
  className: "6ème A",
  subject: "Mathématiques",
};

// MOCK STUDENTS + MARKS
const initialStudents = [
  { id: 1, name: "MUGISHA Freud", mark: 18, comment: "Excellent travail !" },
  { id: 2, name: "DUPONT Marie", mark: 15, comment: "Bon niveau" },
  { id: 3, name: "KAYEMBE Joel", mark: 8, comment: "À revoir les fractions" },
  { id: 4, name: "NSANZIMFURA Aline", mark: 20, comment: "Parfait !" },
  { id: 5, name: "IRAKOZE David", mark: 12, comment: "" },
  { id: 6, name: "UWASE Chantal", mark: 19.5, comment: "Très bien" },
  { id: 7, name: "NIYONSABA Patrick", mark: 10, comment: "Peut mieux faire" },
  { id: 8, name: "MUKASA Sarah", mark: 17, comment: "Bravo !" },
];

export default function GradeStudentsPage() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = students.length;
  const gradedCount = students.filter((s) => s.mark !== null && s.mark !== undefined).length;
  const average = students.reduce((sum, s) => sum + (s.mark || 0), 0) / totalStudents || 0;
  const bestMark = Math.max(...students.map((s) => s.mark || 0));
  const worstMark = Math.min(...students.filter((s) => s.mark !== null).map((s) => s.mark));

  const updateMark = (id: number, mark: number) => {
    if (mark < 0 || mark > testInfo.maxPoints) {
      toast.error(`La note doit être entre 0 et ${testInfo.maxPoints}`);
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, mark } : s))
    );
    toast.success("Note enregistrée", { duration: 1000 });
  };

  const updateComment = (id: number, comment: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, comment } : s))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-8 shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Saisie des notes
            </CardTitle>
            <div className="mt-6 space-y-4">
              <h2 className="text-3xl font-bold">{testInfo.title}</h2>
              <div className="flex flex-wrap justify-center gap-6 text-lg">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {testInfo.className}
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {testInfo.subject}
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {format(testInfo.date, "EEEE dd MMMM yyyy", { locale: fr })}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Sur {testInfo.maxPoints} points
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap- gap-6 mb-10">
          <Card className="text-center p-6 bg-green-50 dark:bg-green-950/30">
            <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-4xl font-bold text-green-600">{bestMark.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Meilleure note</p>
          </Card>
          <Card className="text-center p-6 bg-blue-50 dark:bg-blue-950/30">
            <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-4xl font-bold text-blue-600">{average.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Moyenne classe</p>
          </Card>
          <Card className="text-center p-6 bg-orange-50 dark:bg-orange-950/30">
            <MessageSquare className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <p className="text-4xl font-bold text-orange-600">{gradedCount}</p>
            <p className="text-sm text-muted-foreground">Notes saisies</p>
          </Card>
          <Card className="text-center p-6 bg-purple-50 dark:bg-purple-950/30">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <p className="text-4xl font-bold text-purple-600">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">Élèves</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            placeholder="Rechercher un élève..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-14 h-14 text-lg rounded-2xl shadow-lg"
          />
        </div>

        {/* Students List */}
        <div className="space-y-6">
          {filtered.map((student) => (
            <Card
              key={student.id}
              className={`p-6 shadow-lg hover:shadow-xl transition-all ${
                student.mark >= testInfo.maxPoints * 0.8
                  ? "border-green-500"
                  : student.mark >= testInfo.maxPoints * 0.5
                  ? "border-yellow-500"
                  : "border-red-500"
              }`}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-white">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold">{student.name}</h3>
                  {student.comment && (
                    <p className="text-muted-foreground mt-2 italic">"{student.comment}"</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max={testInfo.maxPoints}
                      step="0.5"
                      value={student.mark || ""}
                      onChange={(e) => updateMark(student.id, Number(e.target.value))}
                      className="text-4xl font-bold text-center w-32 h-20"
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      / {testInfo.maxPoints}
                    </p>
                  </div>

                  <Textarea
                    placeholder="Commentaire (facultatif)"
                    value={student.comment || ""}
                    onChange={(e) => updateComment(student.id, e.target.value)}
                    className="w-64"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <Button size="lg" className="shadow-2xl text-xl px-12 py-8 rounded-full gap-3">
            <Save className="w-6 h-6" />
            Save All Grades
          </Button>
        </div>
      </div>
    </div>
  );
}