export const FULL_ACCESS: Record<string, string[]> = {
  "students": [
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "teacher",
    "student_parent", "student",
  ],
  "attendance": [
    "academic_principal", "discipline_principal", "teacher",
  ],
  "behavior": [
    "academic_principal", "discipline_principal", "teacher",
  ],
  "calendar": [
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "transporter", "driver",
    "boarding", "daycare", "restaurant", "storage",
  ],
  "timetable": [
    "director", "academic_principal", "discipline_principal",
    "receptionist",
  ],
  "announcements": [
    "director", "academic_principal", "discipline_principal",
    "receptionist", "accountant", "hr", "transporter", "driver",
    "boarding", "daycare", "restaurant", "storage",
  ],
  "finance": [
    "accountant"
  ],
  "academics": [
    "director", "academic_principal", "teacher",
  ],
  "academic-planning": [
    "director", "academic_principal",
  ],
  "course-tracking": [
    "director", "academic_principal", "receptionist",
  ],
  "transport": [
    "transporter",
  ],
  "reports": [
    "global_control", "system_admin", "director",
  ],
  "restaurant": [
    "restaurant",
  ],
  "storage": [
    "storage",
  ],
  "boarding": [
    "boarding",
  ],
  "daycare": [
    "daycare",
  ],
  "employees": [
    "hr",
  ],
  "audit-logs": [
    "global_control", "system_admin", "body_control",
  ],
  "settings": [
    "system_admin",
  ],
}

export type ManageableModule = keyof typeof FULL_ACCESS
