const ALL_ROLES = [
  "global_control", "system_admin", "body_control",
] as const

export const MODULE_ACCESS = {
  Dashboard: null,
  Students: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "teacher",
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
    "teacher", "student",
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
    "driver",
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
    "director", "academic_principal", "teacher",
  ],
  Transport: [
    ...ALL_ROLES,
    "director", "accountant", "receptionist", "transporter", "driver", "student",
  ],
  Employees: [
    ...ALL_ROLES,
    "director", "hr", "receptionist", "accountant",
  ],
  Restaurant: [
    ...ALL_ROLES,
    "director", "accountant", "restaurant", "student",
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
    "director", "accountant", "restaurant", "storage",
  ],
  Rapports: [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "teacher",
  ],
  "Audit Logs": [
    "global_control", "system_admin",
  ],
  "Academic Planning": [
    ...ALL_ROLES,
    "director", "academic_principal", "discipline_principal",
  ],
  Settings: [
    "global_control", "system_admin",
  ],
} as const satisfies Record<string, string[] | null>

export type ModuleName = keyof typeof MODULE_ACCESS
