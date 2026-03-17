// app/attendance/page.tsx
import { AttendanceSessionsTable } from "@/components/attendance/sessions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export const metadata = {
  title: "Séances de présence - Gestion Scolaire",
};

export default function AttendancePage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CalendarDays className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Séances de présence</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceSessionsTable />
        </CardContent>
      </Card>
    </div>
  );
}