import { SchoolAttendanceTable } from "@/components/attendance/school-attendance-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, CalendarCheck } from "lucide-react";

export const metadata = {
  title: "Présence journalière — EduCore",
  description: "Suivi des présences journalières des élèves à l'école",
};

export default function SchoolAttendancePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
          <School className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Présence journalière</h1>
          <p className="text-muted-foreground text-sm">
            Enregistrez les présences, absences et retards quotidiens par classe
          </p>
        </div>
      </div>

      <Card className="shadow-md border-0 bg-card">
        <CardHeader className="border-b bg-muted/30 rounded-t-xl">
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">Feuille de présence du jour</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <SchoolAttendanceTable />
        </CardContent>
      </Card>
    </div>
  );
}
