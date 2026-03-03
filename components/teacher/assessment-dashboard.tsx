// src/components/teacher/assessment-dashboard.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Calendar, Users, Trophy, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";


// MOCK DATA — Looks 100% real
const mockClasses = [
  { id: 1, name: "6ème A", subject: "Mathématiques", studentsCount: 28 },
  { id: 2, name: "5ème B", subject: "Français", studentsCount: 25 },
  { id: 3, name: "4ème C", subject: "Histoire-Géo", studentsCount: 30 },
];

const mockStudents = {
  1: [
    { id: 1, name: "MUGISHA Freud" },
    { id: 2, name: "DUPONT Marie" },
    { id: 3, name: "KAYEMBE Joel" },
    { id: 4, name: "NSANZIMFURA Aline" },
    // ... more
  ],
  2: [
    { id: 5, name: "IRAKOZE David" },
    { id: 6, name: "UWASE Chantal" },
    // ...
  ],
  3: [
    { id: 7, name: "NIYONSABA Patrick" },
    // ...
  ],
};

const mockAssessments = [
  {
    id: 1,
    title: "Devoir de Mathématiques - Chapitre 3",
    type: "devoir",
    classId: 1,
    date: new Date("2025-04-02"),
    maxPoints: 20,
    average: 14.8,
  },
  {
    id: 2,
    title: "Examen Semestriel Français",
    type: "examen",
    classId: 2,
    date: new Date("2025-03-28"),
    maxPoints: 100,
    average: 72.3,
  },
];

export function AssessmentDashboard() {
    const router = useRouter();
  const [assessments, setAssessments] = useState(mockAssessments);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    type: "devoir" as "devoir" | "examen" | "interrogation",
    classId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    maxPoints: "20",
  });

  const filtered = assessments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const createAssessment = () => {
    const classInfo = mockClasses.find((c) => c.id === Number(newAssessment.classId));
    if (!classInfo || !newAssessment.title) {
      toast.error("Veuillez remplir tous les champs");
      return;
      return;
    }

    const newAss = {
      id: assessments.length + 1,
      title: newAssessment.title,
      type: newAssessment.type,
      classId: Number(newAssessment.classId),
      date: new Date(newAssessment.date),
      maxPoints: Number(newAssessment.maxPoints),
      average: 0,
    };

    setAssessments([newAss, ...assessments]);
    toast.success("Évaluation créée ! Vous pouvez maintenant noter les élèves.");
    setIsCreateOpen(false);
    setNewAssessment({
      title: "",
      type: "devoir",
      classId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      maxPoints: "20",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une évaluation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12"
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-3">
              <Plus className="w-5 h-5" />
              Nouvelle évaluation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une évaluation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Titre (ex: Devoir sur les fractions)"
                value={newAssessment.title}
                onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
              />
              <Select
                value={newAssessment.type}
                onValueChange={(v) => setNewAssessment({ ...newAssessment, type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="devoir">Devoir</SelectItem>
                  <SelectItem value="examen">Examen</SelectItem>
                  <SelectItem value="interrogation">Interrogation</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newAssessment.classId}
                onValueChange={(v) => setNewAssessment({ ...newAssessment, classId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} - {c.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newAssessment.date}
                onChange={(e) => setNewAssessment({ ...newAssessment, date: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Sur combien ? (20, 100...)"
                value={newAssessment.maxPoints}
                onChange={(e) => setNewAssessment({ ...newAssessment, maxPoints: e.target.value })}
              />
              <Button onClick={createAssessment} className="w-full">
                Créer l'évaluation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ass) => {
          const classInfo = mockClasses.find((c) => c.id === ass.classId);
          return (
            <Card key={ass.id} className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{ass.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {classInfo?.name} • {classInfo?.subject}
                    </CardDescription>
                  </div>
                  <Badge variant={ass.type === "examen" ? "destructive" : "default"}>
                    {ass.type === "devoir" ? "Devoir" : ass.type === "examen" ? "Examen" : "Interro"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
  <div className="flex items-center gap-2 text-muted-foreground">
    <Calendar className="w-4 h-4" />
    {format(ass.date, "EEEE dd MMMM yyyy", { locale: fr })}
  </div>
  <div className="flex items-center gap-2">
    <Trophy className="w-5 h-5 text-yellow-600" />
    <span className="font-bold">Sur {ass.maxPoints} points</span>
  </div>
  {ass.average > 0 && (
    <div className="text-center py-3 bg-muted rounded-lg">
      <p className="text-3xl font-bold text-primary">{ass.average.toFixed(1)}</p>
      <p className="text-sm text-muted-foreground">Moyenne de la classe</p>
    </div>
  )}
  <Button
    className="w-full"
    onClick={() => router.push(`/dashboard/assessments/${ass.id}/grade`)}
  >
    Noter les élèves
  </Button>
</CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-20">
          <Trophy className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Aucune évaluation pour le moment</p>
          <p className="text-muted-foreground">Créez votre première évaluation !</p>
        </Card>
      )}
    </div>
  );
}