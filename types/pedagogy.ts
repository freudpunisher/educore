import { z } from "zod";
import { createPaginatedSchema } from "./api";

export const courseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  subject: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  classroom: z.number(),
  teacher: z.number().nullable().optional(),
  teacher_name: z.string().nullable().optional(),
  credits: z.any().optional(),
  max_points_dw: z.any().optional(),
  max_points_exam: z.any().optional(),
  max_points_total: z.any().optional(),
});

export const assessmentTypeSchema = z.object({
  id: z.number(),
  code: z.string(),
  label: z.string(),
  weight: z.string(),
  level: z.string().optional(),
});

export const assessmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  course: z.number(),
  course_display: z.string().optional(),
  term: z.number(),
  term_display: z.string().optional(),
  assessment_type: z.number(),
  assessment_type_label: z.string().optional(),
  assessment_type_detail: assessmentTypeSchema.optional(),
  max_score: z.string(),
  date: z.string().nullable().optional(),
  published: z.boolean(),
  is_finalized: z.boolean().optional(),
  has_grades: z.boolean().optional(),
});

export const assessmentCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  course: z.number().min(1, "Course is required"),
  term: z.number().min(1, "Term is required"),
  assessment_type: z.number().min(1, "Type is required"),
  max_score: z.string().min(1, "Max score is required"),
  date: z.string().optional(),
});

export const reportCardSchema = z.object({
  id: z.number(),
  enrollment: z.number(),
  enrollment_detail: z.any(),
  term: z.number(),
  term_display: z.string(),
  academic_year_display: z.string().optional(),
  report_type: z.string().optional(),
  generated_at: z.string(),
  data: z.any(),
});

export const gradeSchema = z.object({
  id: z.number(),
  enrollment: z.number(),
  student_name: z.string(),
  assessment: z.number(),
  assessment_display: z.string(),
  course: z.number().optional(),
  course_name: z.string().optional(),
  assessment_type_code: z.string().optional(),
  term: z.number().optional(),
  score: z.string(),
  percentage: z.number().nullable().optional(),
  letter_grade: z.string().nullable().optional(),
  gpa_points: z.string().nullable().optional(),
  comment: z.string(),
});

export const gradeCreateSchema = z.object({
  enrollment: z.number().min(1, "Enrollment is required"),
  assessment: z.number().min(1, "Assessment is required"),
  score: z.string().min(1, "Score is required"),
  comment: z.string().optional(),
});

export const paginatedCourseSchema = createPaginatedSchema(courseSchema);
export const paginatedGradeSchema = createPaginatedSchema(gradeSchema);
export const paginatedAssessmentSchema = createPaginatedSchema(assessmentSchema);
export const paginatedReportCardSchema = createPaginatedSchema(reportCardSchema);

export type Course = z.infer<typeof courseSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type Grade = z.infer<typeof gradeSchema>;
export type ReportCard = z.infer<typeof reportCardSchema>;
export type GradeCreate = z.infer<typeof gradeCreateSchema>;
export const assessmentTypeCreateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  label: z.string().min(1, "Label is required"),
  weight: z.string().min(1, "Weight is required"),
  level: z.string().default("all"),
});

export type AssessmentTypeCreate = z.infer<typeof assessmentTypeCreateSchema>;

export type AssessmentCreate = z.infer<typeof assessmentCreateSchema>;
