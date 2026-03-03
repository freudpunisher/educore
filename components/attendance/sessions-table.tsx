// src/components/attendance/sessions-table.tsx
"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Calendar, Clock, Users, Lock, Unlock, BookOpen } from "lucide-react";

// MOCK DATA — Looks 100% real
const mockSessions = [
  {
    id: 101,
    date: new Date("2025-04-05"),
    start_time: "08:00",
    end_time: "10:00",
    classroom_name: "6ème A",
    subject: "Mathématiques",
    attendances_count: "24/26",
    is_locked: false,
  },
  {
    id: 102,
    date: new Date("2025-04-04"),
    start_time: "10:15",
    end_time: "12:00",
    classroom_name: "5ème B",
    subject: "Français",
    attendances_count: "21/25",
    is_locked: true,
  },
  {
    id: 103,
    date: new Date("2025-04-03"),
    start_time: "13:30",
    end_time: "15:00",
    classroom_name: "4ème C",
    subject: "Histoire-Géo",
    attendances_count: "28/28",
    is_locked: false,
  },
  {
    id: 104,
    date: new Date("2025-04-02"),
    start_time: "08:00",
    end_time: "09:30",
    classroom_name: "6ème A",
    subject: "Anglais",
    attendances_count: "23/26",
    is_locked: false,
  },
  {
    id: 105,
    date: new Date(),
    start_time: "14:00",
    end_time: "15:30",
    classroom_name: "3ème A",
    subject: "Physique-Chimie",
    attendances_count: "0/22",
    is_locked: false,
  },
];

export function AttendanceSessionsTable() {
  {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = mockSessions.filter((s) =>
    `${s.classroom_name} ${s.subject || ""} ${format(s.date, "dd/MM/yyyy")}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const goToSession = (id: number) => {
    router.push(`attendance/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une séance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12"
          />
        </div>

        <Button onClick={() => toast.success("Création bientôt disponible !")} className="gap-2">
          <Plus className="w-5 h-5" />
          Nouvelle séance
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <Calendar className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Aucune séance trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Date & Heure</TableHead>
                <TableHead className="font-bold">Classe</TableHead>
                <TableHead className="font-bold">Matière</TableHead>
                <TableHead className="font-bold">Présents</TableHead>
                <TableHead className="font-bold">Statut</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((session) => (
                <TableRow
                  key={session.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => goToSession(session.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">
                          {format(session.date, "EEEE dd MMMM", { locale: fr })}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.start_time} → {session.end_time}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {session.classroom_name}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {session.subject ? (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{session.subject}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">{session.attendances_count}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={session.is_locked ? "destructive" : "default"} className="gap-1">
                      {session.is_locked ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Verrouillée
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Ouverte
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSession(session.id);
                      }}
                    >
                      Prendre présence
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}}