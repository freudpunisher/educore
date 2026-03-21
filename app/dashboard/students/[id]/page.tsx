"use client";

import { useStudentDetail } from "@/hooks/use-students";
import { StudentDetailView } from "@/components/students/student-detail-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Edit, AlertCircle, GraduationCap } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const studentId = id ? Number(id) : null;

  const { data: student, isLoading, error } = useStudentDetail(studentId);

  /* ─── Loading ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-5">
        {/* Spinner ring */}
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border-4 border-muted" />
          <span className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <GraduationCap className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground tracking-wide text-sm uppercase">
            Loading Profile
          </p>
          <p className="text-muted-foreground text-sm">
            Fetching student record…
          </p>
        </div>
      </div>
    );
  }

  /* ─── Error / Not found ────────────────────────────────────── */
  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-6 gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-destructive/8 border border-destructive/15 flex items-center justify-center">
            <AlertCircle className="h-9 w-9 text-destructive/70" />
          </div>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive/20 border-2 border-background" />
        </div>

        <div className="space-y-2 max-w-sm">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Student record not found
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This record may have been removed or the link you followed is no
            longer valid. Please verify and try again.
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-2 border-border/60 hover:bg-muted/60 transition-colors"
          onClick={() => router.push("/dashboard/students")}
        >
          <ArrowLeft className="w-4 h-4" />
          Return to students
        </Button>
      </div>
    );
  }

  /* ─── Main ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">

        {/* ── Top navigation bar ─────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: breadcrumb + title */}
          <div className="space-y-2.5">
            <button
              onClick={() => router.push("/dashboard/students")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Students
            </button>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-none">
                {student.full_name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-xs tracking-widest border border-border/50">
                #{student.enrollment_number}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-border/60 hover:bg-muted/60 text-sm font-medium"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-border/80 via-border/30 to-transparent" />

        {/* ── Detail card ─────────────────────────────────── */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden ring-1 ring-black/[0.03]">
          {/* Subtle header accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

          <StudentDetailView student={student} />
        </div>

      </div>
    </div>
  );
}