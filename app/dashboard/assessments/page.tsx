// app/teacher/assessments/page.tsx
import { AssessmentDashboard } from "@/components/teacher/assessment-dashboard";

export const metadata = {
  title: "Évaluations & Notes - Espace Enseignant",
};

export default function TeacherAssessmentsPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Mes Évaluations
        </h1>
        <p className="text-xl text-muted-foreground mt-4">
          Créez des devoirs, examens, interrogations et notez vos élèves
        </p>
      </div>

      <AssessmentDashboard />
    </div>
  );
}