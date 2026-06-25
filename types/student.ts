// src/lib/types/student.ts ← FINAL VERSION
import { z } from "zod";
import { createPaginatedSchema } from "./api";
import { transportSubscriptionSchema } from "./transport";

export const enrollmentInfoSchema = z.object({
  classroom: z.string(),
  academic_year: z.string(),
}).nullable();

export const studentListSchema = z.object({
  id: z.coerce.number(),
  full_name: z.string().optional(),
  enrollment_number: z.string().optional(),
  class_level: z.string().optional().nullable(),
  gender: z.coerce.number().optional(),
  enrollment_date: z.union([z.string(), z.date()]).nullish().transform((val) => (val ? new Date(val) : new Date())),
  is_enrolled: z.boolean().optional(),
  is_validated: z.boolean().optional(),
  account_active: z.boolean().optional(),
  registration_paid: z.boolean().optional(),
  enrollment_info: z.union([enrollmentInfoSchema, z.record(z.any()), z.string()]).nullish(),
  image: z.string().nullable().optional(),
}).passthrough();

export const studentsListArraySchema = z.array(studentListSchema);
export const paginatedStudentListSchema = createPaginatedSchema(studentListSchema);

export type Student = z.infer<typeof studentListSchema>;
export type EnrollmentInfo = z.infer<typeof enrollmentInfoSchema>;

export type AcademicsEnrollmentsListRequest = {
  academic_year?: number;
  classroom?: number;
  /**
   * A search term.
   */
  search?: string;
  student?: number;
  [property: string]: any;
};

// --- Student Detail View Types ---

export enum DocumentTypeEnum {
  Bulletin = "bulletin",
  Certificate = "certificate",
  Enrollment = "enrollment",
  ExamCopy = "exam_copy",
  Medical = "medical",
  Other = "other",
}

export const studentDocumentSchema = z.object({
  // Real API keys (based on sample)
  type: z.string().optional(),
  file: z.string().optional(),
  date: z.union([z.string(), z.date()]).nullish(),

  // Internal/Legacy keys for compatibility
  id: z.coerce.number().optional(),
  student: z.coerce.number().optional(),
  document_type: z.union([z.nativeEnum(DocumentTypeEnum), z.string()]).optional(),
  file_url: z.string().optional(),
  description: z.string().nullable().optional(),
  is_public: z.coerce.boolean().optional(),
  uploaded_at: z.union([z.string(), z.date()]).nullish(),
  uploaded_by_user: z.string().optional(),
}).passthrough().transform((data) => ({
  ...data,
  document_type: data.type || data.document_type || "Document",
  file_url: data.file || data.file_url,
  uploaded_at: data.date || data.uploaded_at || new Date(),
}));

export type StudentDocument = z.infer<typeof studentDocumentSchema>;

export enum RoleEnum {
  GlobalControl = "global_control",
  SystemAdmin = "system_admin",
  BodyControl = "body_control",
  Director = "director",
  AcademicPrincipal = "academic_principal",
  DisciplinePrincipal = "discipline_principal",
  Receptionist = "receptionist",
  Accountant = "accountant",
  Hr = "hr",
  Transporter = "transporter",
  Driver = "driver",
  Teacher = "teacher",
  StudentParent = "student_parent",
  Student = "student",
  Boarding = "boarding",
  Daycare = "daycare",
  Restaurant = "restaurant",
  Storage = "storage",
  None = "none",
}

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const accountDetailSchema = z.object({
  id: z.number(),
  user: userSchema,
  role: z.nativeEnum(RoleEnum),
  phone_number: z.string().nullable(),
  address: z.string(),
  active: z.boolean().optional(),
});

export enum RelationshipEnum {
  Father = "father",
  Guardian = "guardian",
  Mother = "mother",
  Other = "other",
}

export const studentParentSchema = z.object({
  // Real API keys (based on sample)
  full_name: z.string().optional(),
  relationship: z.union([z.nativeEnum(RelationshipEnum), z.string()]).optional(),
  phone: z.string().nullable().optional(),
  is_primary: z.boolean().optional(),

  // Internal/Legacy keys
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().nullable().or(z.literal("")).optional(),
  phone_number: z.string().nullable().or(z.literal("")).optional(),
  is_primary_contact: z.boolean().optional(),
}).passthrough().transform((data) => ({
  ...data,
  full_name: data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Parent",
  phone: data.phone || data.phone_number,
  is_primary: data.is_primary ?? data.is_primary_contact ?? false,
}));

export type StudentParent = z.infer<typeof studentParentSchema>;

export const studentAccountInfoSchema = z.object({
  id: z.coerce.number(),
  active: z.coerce.boolean(),
  role: z.string(),
  username: z.string(),
}).passthrough();

export const studentDetailSchema = z.object({
  id: z.coerce.number().optional().default(0),
  enrollment_number: z.string().optional().default("N/A"),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  full_name: z.string().optional().default("Unknown Student"),
  gender: z.coerce.number().optional().default(0),
  date_of_birth: z.union([z.string(), z.date()]).nullable().optional().transform((val) => (val ? new Date(val) : null)),
  enrollment_date: z.union([z.string(), z.date()]).nullish().transform((val) => (val ? new Date(val) : new Date())),
  enrollment_info: z.union([z.string(), z.record(z.any()), z.null()]).optional(),
  is_enrolled: z.coerce.boolean().optional(),
  is_validate: z.coerce.boolean().optional(),
  account_info: z.union([z.string(), z.record(z.any()), z.null()]).optional(),
  account: z.any().optional(),
  parent_contact: z.string().nullish(),
  parent_email: z.string().nullish(),
  documents: z.array(studentDocumentSchema).default([]),
  responsables: z.array(studentParentSchema).nullish(),
  parents_info: z.array(studentParentSchema).nullish(),
  image: z.string().nullable().optional(),
  validated_at: z.union([z.string(), z.date()]).nullable().optional(),
  current_class: z.object({
    class_name: z.string(),
    academic_year: z.string(),
  }).nullable().optional(),
}).passthrough().transform((data: any) => ({
  ...data,
  is_validate: data.is_validate ?? data.is_validated ?? false,
  parents_info: data.responsables || data.parents_info || [],
  account_info: data.account || data.account_info,
}));

export type StudentDetail = z.infer<typeof studentDetailSchema>;

// --- Academics ---
export const studentGradesSchema = z.object({
  assessment_title: z.string().nullable().optional(),
  comment: z.string().optional().nullable(),
  course_name: z.string().nullable().optional(),
  percentage: z.coerce.string().nullable().optional(),
  score: z.coerce.string().nullable().optional(),
}).passthrough();

export const enrollmentAcademicsSchema = z.object({
  id: z.number(),
  academic_year_label: z.string().nullable().optional(),
  class_name: z.string().nullable().optional(),
  date_enrolled: z.string().nullable().transform((str) => (str ? new Date(str) : new Date())).optional(),
  grades: z.array(studentGradesSchema).default([]),
  is_current: z.boolean().optional(),
  report_cards_data: z.any().optional(),
  student_count: z.coerce.number().optional().default(0),
  assessment_count: z.coerce.number().optional().default(0),
  class_capacity: z.coerce.number().optional().default(0),
  course_count: z.coerce.number().optional().default(0),
  class_average: z.coerce.number().optional().default(0.0),
  subjects: z.array(z.object({
    course_name: z.string(),
    teacher: z.string(),
    student_grade: z.union([z.string(), z.number()]),
    class_average: z.coerce.number(),
  })).default([]),
}).passthrough();

export const studentAcademicsResponseSchema = z.object({
  academic_history: z.array(enrollmentAcademicsSchema).default([]),
}).passthrough();

export type StudentAcademics = z.infer<typeof studentAcademicsResponseSchema>;

// --- Finance ---
export const studentPaymentSchema = z.object({
  id: z.number(),
  amount: z.coerce.string(),
  created_at: z.string().transform((str) => new Date(str)),
  payment_mode: z.number().optional(),
}).passthrough();

export const studentInvoiceSchema = z.object({
  id: z.number(),
  reference: z.string(),
  amount: z.coerce.string(),
  balance: z.coerce.string(),
  status: z.number().optional(),
  created_at: z.string().transform((str) => new Date(str)),
  payments: z.array(studentPaymentSchema).default([]),
}).passthrough();

export const studentFinanceResponseSchema = z.object({
  invoices: z.array(studentInvoiceSchema).default([]),
  outstanding_balance: z.coerce.string(),
  total_due: z.coerce.string(),
  total_paid: z.coerce.string(),
}).passthrough();

export type StudentFinance = z.infer<typeof studentFinanceResponseSchema>;

// --- Student Life ---
export const attendanceStatsSchema = z.object({
  absent_count: z.coerce.number(),
  late_count: z.coerce.number(),
  present_count: z.coerce.number(),
  total_count: z.coerce.number(),
}).passthrough();

export enum DisciplineStatusEnum {
  Appealed = "appealed",
  Cancelled = "cancelled",
  Recorded = "recorded",
}

export const studentRecordSchema = z.object({
  id: z.number(),
  date_incident: z.string().transform((str) => new Date(str)),
  description: z.string().optional().nullable(),
  points_deducted: z.string(),
  reason_name: z.string(),
  status: z.nativeEnum(DisciplineStatusEnum).optional(),
}).passthrough();

export const studentLifeResponseSchema = z.object({
  attendance_stats: attendanceStatsSchema.optional(),
  attendance_history: z.array(z.object({
    id: z.number(),
    date: z.string().transform((str) => new Date(str)),
    session_type: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    status: z.string(),
    lateness_minutes: z.coerce.number().optional().default(0),
    notes: z.string().optional().nullable(),
  }).passthrough()).default([]),
  discipline_history: z.array(studentRecordSchema).default([]),
  discipline_score: z.union([z.string(), z.number()]),
}).passthrough();

export type StudentLife = z.infer<typeof studentLifeResponseSchema>;

// --- Services ---
export const studentDaycareSchema = z.object({
  id: z.number(),
  daycare_name: z.string(),
  is_active: z.boolean().optional(),
  start_date: z.string().transform((str) => new Date(str)),
}).passthrough();

export const studentHousingSchema = z.object({
  id: z.number(),
  room_name: z.string().nullable().optional(),
  room_type: z.string().nullable().optional(),
  bed_number: z.string().nullable().optional(),
  fees: z.union([z.string(), z.number()]).optional().transform(val => String(val || "0")),
  is_active: z.boolean().optional(),
  start_date: z.string().transform((str) => new Date(str)),
  end_date: z.string().nullable().transform((val) => (val ? new Date(val) : null)).optional(),
  bed: z.number().optional(),
  room: z.number().optional(),
  student: z.number().optional(),
  student_name: z.string().optional(),
}).passthrough();

export const mealPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  monthly_cost: z.string(),
  is_active: z.boolean().optional(),
  description: z.string().nullable().optional(),
  includes_breakfast: z.boolean().optional(),
  includes_dinner: z.boolean().optional(),
  includes_lunch: z.boolean().optional(),
  meals_composition: z.array(z.string()).default([]),
  meals_per_week: z.number().optional(),
}).passthrough();

export enum StudentMealSubscriptionStatusEnum {
  Active = "active",
  Cancelled = "cancelled",
  Expired = "expired",
  Paused = "paused",
}

export const studentMealSubscriptionSchema = z.object({
  id: z.number(),
  meal_plan_detail: mealPlanSchema,
  amount_paid: z.string().optional(),
  amount_remaining: z.string(),
  total_amount_due: z.string(),
  is_paid: z.boolean(),
  is_expired: z.boolean(),
  start_date: z.string().transform((str) => new Date(str)),
  end_date: z.string().nullable().transform((val) => (val ? new Date(val) : null)).optional(),
  status: z.nativeEnum(StudentMealSubscriptionStatusEnum).optional(),
  student_name: z.string().optional(),
  student_enrollment: z.string().optional(),
}).passthrough();

export const studentServicesResponseSchema = z.object({
  daycare: z.array(studentDaycareSchema).default([]),
  housing: z.array(studentHousingSchema).default([]),
  meals: z.array(studentMealSubscriptionSchema).default([]),
  transport: z.array(transportSubscriptionSchema).default([]),
}).passthrough();

export type StudentServices = z.infer<typeof studentServicesResponseSchema>;

// --- Transactions ---
export enum Status4EcEnum {
  Active = "active",
  Damaged = "damaged",
  Returned = "returned",
}

export const studentDistributionSchema = z.object({
  id: z.number(),
  product_name: z.string(),
  quantity: z.number().optional(),
  distribution_date: z.string().transform((str) => new Date(str)),
  status: z.nativeEnum(Status4EcEnum).optional(),
  notes: z.string().optional().nullable(),
  expected_return_date: z.string().nullable().optional(),
  returned_date: z.string().nullable().optional(),
}).passthrough();

export const studentSaleSchema = z.object({
  id: z.number(),
  product_name: z.string(),
  quantity: z.number().optional(),
  total_price: z.coerce.string(),
  date: z.string().transform((str) => new Date(str)),
}).passthrough();

export const studentTransactionsResponseSchema = z.object({
  distributions: z.array(studentDistributionSchema).default([]),
  sales: z.array(studentSaleSchema).default([]),
}).passthrough();

export type StudentTransactions = z.infer<typeof studentTransactionsResponseSchema>;