export const MODULE_ACCESS = {
  Dashboard: null,
  Students: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "teacher", "student_parent", "student",
  ],
  Attendance: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "discipline_principal", "teacher",
  ],
  Behavior: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "discipline_principal", "teacher",
  ],
  Calendar: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "driver",
    "teacher", "student",
    "boarding", "daycare", "restaurant", "storage",
  ],
  Timetable: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "discipline_principal",
  ],
  Announcements: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "driver",
    "teacher", "student_parent", "student",
    "boarding", "daycare", "restaurant", "storage",
  ],
  Finances: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal",
    "receptionist", "accountant", "student_parent",
  ],
  Pedagogy: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "teacher",
  ],
  "Course Tracking": [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "teacher",
  ],
  Transport: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "driver",
  ],
  Employees: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "hr",
  ],
  Restaurant: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "restaurant",
  ],
  Daycare: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "daycare",
  ],
  Boarding: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "boarding",
  ],
  Storage: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "storage",
  ],
  Rapports: [
    "global_control", "system_admin", "body_control",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "teacher",
  ],
  "Audit Logs": [
    "global_control", "system_admin",
  ],
  Settings: [
    "global_control", "system_admin", "body_control",
  ],
} as const satisfies Record<string, string[] | null>

export type ModuleName = keyof typeof MODULE_ACCESS
