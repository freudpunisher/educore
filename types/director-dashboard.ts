import { z } from "zod"

// ── Shared ──
const numericString = z.union([z.number(), z.string()]).transform(Number)

// ── Tab 1: Overview ──
export const overviewKpiSchema = z.object({
  total_students: z.number(),
  total_teachers: z.number(),
  total_staff: z.number(),
  active_classes: z.number(),
  occupied_rooms: z.number(),
  total_subjects: z.number(),
  total_parents: z.number(),
})

const enrollmentTrendPointSchema = z.object({
  month: z.string(),
  value: z.number(),
})

const studentDistributionSchema = z.object({
  by_gender: z.record(z.string(), z.number()),
  by_level: z.record(z.string(), z.number()),
  by_age_range: z.record(z.string(), z.number()),
})

const recentEnrollmentSchema = z.object({
  id: z.number(),
  student_name: z.string(),
  class_name: z.string(),
  date: z.string(),
  status: z.string(),
})

const recentActivitySchema = z.object({
  id: z.number(),
  user: z.string(),
  action: z.string(),
  module: z.string(),
  time: z.string(),
})

export const overviewTabSchema = z.object({
  kpis: overviewKpiSchema,
  enrollment_trend: z.array(enrollmentTrendPointSchema),
  student_distribution: studentDistributionSchema,
  recent_enrollments: z.array(recentEnrollmentSchema),
  recent_activities: z.array(recentActivitySchema),
})

export type OverviewTab = z.infer<typeof overviewTabSchema>

// ── Tab 2: Finances ──
const financeKpiSchema = z.object({
  total_expected: z.number(),
  total_paid: z.number(),
  outstanding: z.number(),
  overdue: z.number(),
  total_refunded: z.number(),
  revenue_today: z.number(),
  revenue_month: z.number(),
  revenue_year: z.number(),
})

const monthlyRevenueSchema = z.object({
  month: z.string(),
  expected: z.number(),
  collected: z.number(),
})

const refundTrendPointSchema = z.object({
  month: z.string(),
  amount: z.number(),
})

const yearComparisonSchema = z.object({
  label: z.string(),
  total_paid: z.number(),
})

const recentPaymentSchema = z.object({
  id: z.number(),
  student_name: z.string(),
  amount: z.number(),
  date: z.string(),
  payment_mode: z.string(),
})

export const financesTabSchema = z.object({
  kpis: financeKpiSchema,
  monthly_revenue: z.array(monthlyRevenueSchema),
  refund_trend: z.array(refundTrendPointSchema),
  year_comparison: z.array(yearComparisonSchema),
  recent_payments: z.array(recentPaymentSchema),
})

export type FinancesTab = z.infer<typeof financesTabSchema>

// ── Tab 3: School Life ──
const attendanceKpiSchema = z.object({
  present: z.object({ count: z.number(), percent: z.number() }),
  absent: z.object({ count: z.number(), percent: z.number() }),
  late: z.object({ count: z.number(), percent: z.number() }),
  teachers_present: z.number(),
  teachers_absent: z.number(),
  staff_absent: z.number(),
})

const disciplineKpiSchema = z.object({
  incidents: z.number(),
  sanctions: z.number(),
  warnings: z.number(),
})

const logisticsKpiSchema = z.object({
  available_buses: z.number(),
  broken_buses: z.number(),
  students_transported: z.number(),
  meals_served: z.number(),
})

const attendanceChartSchema = z.object({
  students: z.object({ present: z.number(), absent: z.number(), late: z.number() }),
  teachers: z.object({ present: z.number(), absent: z.number() }),
})

const criticalAbsenceSchema = z.object({
  id: z.number(),
  student_name: z.string(),
  class_name: z.string(),
  absence_count: z.number(),
})

const heavySanctionSchema = z.object({
  id: z.number(),
  student_name: z.string(),
  reason: z.string(),
  points: z.number(),
  date: z.string(),
  status: z.string(),
})

export const schoolLifeTabSchema = z.object({
  attendance: attendanceKpiSchema,
  discipline: disciplineKpiSchema,
  logistics: logisticsKpiSchema,
  attendance_chart: attendanceChartSchema,
  critical_absences: z.array(criticalAbsenceSchema),
  heavy_sanctions: z.array(heavySanctionSchema),
})

export type SchoolLifeTab = z.infer<typeof schoolLifeTabSchema>

// ── Tab 4: Pedagogy ──
const topStudentSchema = z.object({
  id: z.number(),
  name: z.string(),
  class_name: z.string(),
  average: z.number(),
})

const topTeacherSchema = z.object({
  id: z.number(),
  name: z.string(),
  average: z.number(),
})

const topClassSchema = z.object({
  id: z.number(),
  name: z.string(),
  average: z.number(),
})

const scoreTrendSchema = z.object({
  term: z.string(),
  average: z.number(),
})

const performanceSchema = z.object({
  top_students: z.array(topStudentSchema),
  top_teachers: z.array(topTeacherSchema),
  top_classes: z.array(topClassSchema),
  best_average: z.number(),
  lowest_average: z.number(),
  overall_average: z.number(),
  pass_rate: z.number(),
  fail_rate: z.number(),
  promotion_rate: z.number(),
  repetition_rate: z.number(),
  dropout_rate: z.number(),
  score_trend: z.array(scoreTrendSchema),
})

const stockKpiSchema = z.object({
  available_products: z.number(),
  low_stock: z.number(),
  out_of_stock: z.number(),
  distributions_in_progress: z.number(),
})

const alertSchema = z.object({
  type: z.string(),
  message: z.string(),
  severity: z.string(),
})

export const pedagogyTabSchema = z.object({
  performance: performanceSchema,
  stock: stockKpiSchema,
  alerts: z.array(alertSchema),
})

export type PedagogyTab = z.infer<typeof pedagogyTabSchema>
