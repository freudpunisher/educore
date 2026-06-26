const ALL_ROLES = [
  "global_control", "system_admin", "body_control",
] as const

export const MODULE_ACCESS = {
  Dashboard: null,
  Students: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "teacher", "transporter",
    "restaurant", "daycare", "student_parent", "student",
  ],
  Attendance: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal", "teacher",
  ],
  Behavior: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal", "teacher",
  ],
  Calendar: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
    "accountant", "hr", "transporter",
    "teacher", "student",
    "boarding", "daycare", "restaurant", "storage",
  ],
  Timetable: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
  ],
  Announcements: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "transporter",
    "teacher", "student_parent", "student",
    "boarding", "daycare", "restaurant", "storage",
  ],
  Finances: [
    ...ALL_ROLES,
    "director",
    "accountant", "student_parent",
  ],
  Pedagogy: [
    ...ALL_ROLES,
    "director", "academic_principal", "teacher",
  ],
  "Course Tracking": [
    ...ALL_ROLES,
    "director", "teacher",
  ],
  Transport: [
    ...ALL_ROLES,
    "director", "accountant", "receptionist", "transporter",
  ],
  Employees: [
    ...ALL_ROLES,
    "director", "hr",
  ],
  Restaurant: [
    ...ALL_ROLES,
    "director", "accountant", "receptionist", "restaurant",
  ],
  Daycare: [
    ...ALL_ROLES,
    "director", "accountant", "receptionist", "daycare",
  ],
  Boarding: [
    ...ALL_ROLES,
    "director", "accountant", "receptionist", "boarding",
  ],
  Storage: [
    ...ALL_ROLES,
    "director", "accountant", "storage", "restaurant",
  ],
  Rapports: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "teacher",
    "transporter", "restaurant", "daycare", "storage",
  ],
  "Audit Logs": [
    "global_control", "system_admin",
  ],
  Settings: [
    "system_admin",
  ],
} as const satisfies Record<string, string[] | null>

export type ModuleName = keyof typeof MODULE_ACCESS
