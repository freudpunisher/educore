export const MODULE_ACCESS = {
  Dashboard: null,
  Students: [
    "global_control", "system_admin",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "teacher",
    "student_parent", "student",
  ],
  Employees: [
    "global_control", "system_admin", "body_control",
    "director", "hr",
  ],
  Attendance: [
    "global_control", "system_admin",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "teacher",
  ],
  Behavior: [
    "global_control", "system_admin",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "teacher",
  ],
  Calendar: [
    "global_control", "system_admin",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "transporter", "driver",
    "teacher",
    "boarding", "daycare", "restaurant", "storage",
  ],
  Timetable: [
    "global_control", "system_admin",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "teacher",
  ],
  Announcements: [
    "global_control", "system_admin",
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "transporter", "driver",
    "teacher",
    "boarding", "daycare", "restaurant", "storage",
  ],
  Finances: [
    "global_control", "system_admin", "body_control",
    "director", "receptionist", "accountant",
  ],
  Pedagogy: [
    "global_control", "system_admin",
    "director", "academic_principal", "teacher",
  ],
  "Academic Planning": [
    "global_control", "system_admin",
    "director", "academic_principal",
  ],
  "Course Tracking": [
    "global_control", "system_admin",
    "director", "academic_principal",
    "receptionist", "teacher",
  ],
  Transport: [
    "global_control", "system_admin",
    "director", "receptionist", "accountant",
    "transporter", "driver",
  ],
  Rapports: [
    "global_control", "system_admin",
    "director",
  ],
  Restaurant: [
    "global_control", "system_admin",
    "director", "receptionist", "accountant",
    "restaurant",
  ],
  Storage: [
    "global_control", "system_admin",
    "director", "receptionist", "accountant",
    "storage",
  ],
  Boarding: [
    "global_control", "system_admin",
    "director", "receptionist", "accountant",
    "boarding",
  ],
  Daycare: [
    "global_control", "system_admin",
    "director", "receptionist", "accountant",
    "daycare",
  ],
  "Audit Logs": [
    "global_control", "system_admin", "body_control",
  ],
  Settings: [
    "system_admin",
  ],
} as const satisfies Record<string, string[] | null>

export type ModuleName = keyof typeof MODULE_ACCESS
