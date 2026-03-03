// Mock data for the application

export interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: "M" | "F"
  class: string
  parentName: string
  parentPhone: string
  parentEmail: string
  address: string
  enrollmentDate: string
  status: "active" | "inactive"
  photo?: string
}

export interface Invoice {
  id: string
  studentId: string
  studentName: string
  amount: number
  dueDate: string
  paidDate?: string
  status: "paid" | "pending" | "overdue"
  type: "tuition" | "transport" | "meals" | "other"
  description: string
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  status: "approved" | "pending" | "rejected"
}

export interface Class {
  id: string
  name: string
  level: string
  teacher: string
  studentCount: number
  schedule: string
}

export interface Course {
  id: string
  name: string
  teacher: string
  class: string
  schedule: string
  room: string
  duration: string
}

export interface Grade {
  id: string
  studentId: string
  studentName: string
  course: string
  grade: number
  maxGrade: number
  date: string
  type: "exam" | "homework" | "quiz"
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  endDate?: string
  type: "holiday" | "exam" | "event" | "meeting" | "other"
  location?: string
  participants?: string[]
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  class: string
  date: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
}

export interface TimetableSlot {
  id: string
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
  startTime: string
  endTime: string
  subject: string
  teacher: string
  room: string
  class: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author: string
  date: string
  priority: "low" | "medium" | "high"
  targetAudience: "all" | "teachers" | "parents" | "students"
  read: boolean
}

export const mockStudents: Student[] = [
  {
    id: "1",
    firstName: "Sophie",
    lastName: "Martin",
    dateOfBirth: "2010-05-15",
    gender: "F",
    class: "5th A",
    parentName: "Marie Martin",
    parentPhone: "06 12 34 56 78",
    parentEmail: "marie.martin@email.fr",
    address: "12 Rue de la Paix, 75001 Paris",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "2",
    firstName: "Lucas",
    lastName: "Dubois",
    dateOfBirth: "2011-03-22",
    gender: "M",
    class: "4th B",
    parentName: "Jean Dubois",
    parentPhone: "06 23 45 67 89",
    parentEmail: "jean.dubois@email.fr",
    address: "45 Avenue des Champs, 75008 Paris",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Bernard",
    dateOfBirth: "2010-11-08",
    gender: "F",
    class: "5th A",
    parentName: "Sophie Bernard",
    parentPhone: "06 34 56 78 90",
    parentEmail: "sophie.bernard@email.fr",
    address: "78 Boulevard Saint-Germain, 75005 Paris",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "4",
    firstName: "Thomas",
    lastName: "Petit",
    dateOfBirth: "2009-07-30",
    gender: "M",
    class: "6th C",
    parentName: "Pierre Petit",
    parentPhone: "06 45 67 89 01",
    parentEmail: "pierre.petit@email.fr",
    address: "23 Rue du Commerce, 75015 Paris",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "5",
    firstName: "Léa",
    lastName: "Roux",
    dateOfBirth: "2011-01-12",
    gender: "F",
    class: "4th A",
    parentName: "Claire Roux",
    parentPhone: "06 56 78 90 12",
    parentEmail: "claire.roux@email.fr",
    address: "56 Rue de Rivoli, 75004 Paris",
    enrollmentDate: "2023-09-01",
    status: "active",
  },
  {
    id: "6",
    firstName: "Hugo",
    lastName: "Moreau",
    dateOfBirth: "2010-09-25",
    gender: "M",
    class: "5th B",
    parentName: "Laurent Moreau",
    parentPhone: "06 67 89 01 23",
    parentEmail: "laurent.moreau@email.fr",
    address: "89 Avenue Montaigne, 75008 Paris",
    enrollmentDate: "2023-09-01",
    status: "inactive",
  },
]

export const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    studentId: "1",
    studentName: "Sophie Martin",
    amount: 450,
    dueDate: "2024-06-30",
    paidDate: "2024-06-25",
    status: "paid",
    type: "tuition",
    description: "Tuition Fees - June 2024",
  },
  {
    id: "INV-002",
    studentId: "2",
    studentName: "Lucas Dubois",
    amount: 450,
    dueDate: "2024-06-30",
    status: "pending",
    type: "tuition",
    description: "Tuition Fees - June 2024",
  },
  {
    id: "INV-003",
    studentId: "3",
    studentName: "Emma Bernard",
    amount: 120,
    dueDate: "2024-06-15",
    paidDate: "2024-06-10",
    status: "paid",
    type: "transport",
    description: "School Transport - June 2024",
  },
  {
    id: "INV-004",
    studentId: "4",
    studentName: "Thomas Petit",
    amount: 450,
    dueDate: "2024-05-30",
    status: "overdue",
    type: "tuition",
    description: "Tuition Fees - May 2024",
  },
  {
    id: "INV-005",
    studentId: "5",
    studentName: "Léa Roux",
    amount: 180,
    dueDate: "2024-06-30",
    paidDate: "2024-06-28",
    status: "paid",
    type: "meals",
    description: "Canteen - June 2024",
  },
]

export const mockExpenses: Expense[] = [
  {
    id: "EXP-001",
    date: "2024-06-15",
    category: "Supplies",
    description: "Purchase of school books",
    amount: 2500,
    paymentMethod: "Bank Transfer",
    status: "approved",
  },
  {
    id: "EXP-002",
    date: "2024-06-20",
    category: "Maintenance",
    description: "Air conditioning repair",
    amount: 850,
    paymentMethod: "Check",
    status: "approved",
  },
  {
    id: "EXP-003",
    date: "2024-06-25",
    category: "Salaries",
    description: "Teacher Salaries - June",
    amount: 15000,
    paymentMethod: "Bank Transfer",
    status: "pending",
  },
  {
    id: "EXP-004",
    date: "2024-06-10",
    category: "Utilities",
    description: "Electricity bill",
    amount: 450,
    paymentMethod: "Direct Debit",
    status: "approved",
  },
]

export const mockClasses: Class[] = [
  {
    id: "1",
    name: "6th A",
    level: "6th Grade",
    teacher: "Mrs Dupont",
    studentCount: 28,
    schedule: "Mon-Fri 8am-4pm",
  },
  {
    id: "2",
    name: "6th B",
    level: "6th Grade",
    teacher: "Mr Laurent",
    studentCount: 25,
    schedule: "Mon-Fri 8am-4pm",
  },
  {
    id: "3",
    name: "5th A",
    level: "5th Grade",
    teacher: "Mrs Bernard",
    studentCount: 30,
    schedule: "Mon-Fri 8am-4pm",
  },
  {
    id: "4",
    name: "5th B",
    level: "5th Grade",
    teacher: "Mr Petit",
    studentCount: 27,
    schedule: "Mon-Fri 8am-4pm",
  },
  {
    id: "5",
    name: "4th A",
    level: "4th Grade",
    teacher: "Mrs Roux",
    studentCount: 26,
    schedule: "Mon-Fri 8am-4pm",
  },
  {
    id: "6",
    name: "4th B",
    level: "4th Grade",
    teacher: "Mr Moreau",
    studentCount: 29,
    schedule: "Mon-Fri 8am-4pm",
  },
]

export const mockCourses: Course[] = [
  {
    id: "1",
    name: "Mathematics",
    teacher: "Mr Dubois",
    class: "5th A",
    schedule: "Mon, Wed, Fri 9am-10am",
    room: "Room 101",
    duration: "1h",
  },
  {
    id: "2",
    name: "French",
    teacher: "Mrs Martin",
    class: "5th A",
    schedule: "Tue, Thu 10am-11am",
    room: "Room 102",
    duration: "1h",
  },
  {
    id: "3",
    name: "History-Geography",
    teacher: "Mr Bernard",
    class: "5th A",
    schedule: "Mon, Thu 2pm-3pm",
    room: "Room 103",
    duration: "1h",
  },
  {
    id: "4",
    name: "Sciences",
    teacher: "Mrs Petit",
    class: "5th A",
    schedule: "Tue, Fri 11am-12pm",
    room: "Lab 1",
    duration: "1h",
  },
  {
    id: "5",
    name: "English",
    teacher: "Mrs Roux",
    class: "5th A",
    schedule: "Mon, Wed 11am-12pm",
    room: "Room 104",
    duration: "1h",
  },
]

export const mockGrades: Grade[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "Sophie Martin",
    course: "Mathematics",
    grade: 16,
    maxGrade: 20,
    date: "2024-06-15",
    type: "exam",
  },
  {
    id: "2",
    studentId: "1",
    studentName: "Sophie Martin",
    course: "French",
    grade: 14,
    maxGrade: 20,
    date: "2024-06-18",
    type: "homework",
  },
  {
    id: "3",
    studentId: "2",
    studentName: "Lucas Dubois",
    course: "Mathematics",
    grade: 12,
    maxGrade: 20,
    date: "2024-06-15",
    type: "exam",
  },
  {
    id: "4",
    studentId: "3",
    studentName: "Emma Bernard",
    course: "Sciences",
    grade: 18,
    maxGrade: 20,
    date: "2024-06-20",
    type: "quiz",
  },
  {
    id: "5",
    studentId: "1",
    studentName: "Sophie Martin",
    course: "English",
    grade: 15,
    maxGrade: 20,
    date: "2024-06-22",
    type: "exam",
  },
]

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Summer Holidays",
    description: "School summer break",
    date: "2024-07-06",
    endDate: "2024-09-02",
    type: "holiday",
  },
  {
    id: "2",
    title: "Mathematics Exam",
    description: "Final mathematics exam for 5th grade",
    date: "2024-06-25",
    type: "exam",
    location: "Room 101",
  },
  {
    id: "3",
    title: "Parent-Teacher Meeting",
    description: "Quarterly meeting with parents",
    date: "2024-06-28",
    type: "meeting",
    location: "Auditorium",
  },
  {
    id: "4",
    title: "School Party",
    description: "End of year celebration",
    date: "2024-06-30",
    type: "event",
    location: "Playground",
  },
  {
    id: "5",
    title: "Pedagogical Council",
    description: "Pedagogical council meeting",
    date: "2024-07-02",
    type: "meeting",
    location: "Teachers' Lounge",
    participants: ["Teachers", "Management"],
  },
]

export const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "Sophie Martin",
    class: "5th A",
    date: "2024-06-24",
    status: "present",
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Lucas Dubois",
    class: "4th B",
    date: "2024-06-24",
    status: "absent",
    notes: "Sick",
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Emma Bernard",
    class: "5th A",
    date: "2024-06-24",
    status: "present",
  },
  {
    id: "4",
    studentId: "4",
    studentName: "Thomas Petit",
    class: "6th C",
    date: "2024-06-24",
    status: "late",
    notes: "Arrived at 8:15 AM",
  },
  {
    id: "5",
    studentId: "5",
    studentName: "Léa Roux",
    class: "4th A",
    date: "2024-06-24",
    status: "present",
  },
  {
    id: "6",
    studentId: "1",
    studentName: "Sophie Martin",
    class: "5th A",
    date: "2024-06-25",
    status: "present",
  },
  {
    id: "7",
    studentId: "2",
    studentName: "Lucas Dubois",
    class: "4th B",
    date: "2024-06-25",
    status: "excused",
    notes: "Medical appointment",
  },
]

export const mockTimetable: TimetableSlot[] = [
  {
    id: "1",
    day: "Monday",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Mathematics",
    teacher: "Mr Dubois",
    room: "Room 101",
    class: "5th A",
  },
  {
    id: "2",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    subject: "French",
    teacher: "Mrs Martin",
    room: "Room 102",
    class: "5th A",
  },
  {
    id: "3",
    day: "Monday",
    startTime: "10:15",
    endTime: "11:15",
    subject: "English",
    teacher: "Mrs Roux",
    room: "Room 104",
    class: "5th A",
  },
  {
    id: "4",
    day: "Monday",
    startTime: "11:15",
    endTime: "12:15",
    subject: "History-Geography",
    teacher: "Mr Bernard",
    room: "Room 103",
    class: "5th A",
  },
  {
    id: "5",
    day: "Tuesday",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Sciences",
    teacher: "Mrs Petit",
    room: "Lab 1",
    class: "5th A",
  },
  {
    id: "6",
    day: "Tuesday",
    startTime: "09:00",
    endTime: "10:00",
    subject: "French",
    teacher: "Mrs Martin",
    room: "Room 102",
    class: "5th A",
  },
  {
    id: "7",
    day: "Wednesday",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Mathematics",
    teacher: "Mr Dubois",
    room: "Room 101",
    class: "5th A",
  },
  {
    id: "8",
    day: "Wednesday",
    startTime: "09:00",
    endTime: "10:00",
    subject: "English",
    teacher: "Mrs Roux",
    room: "Room 104",
    class: "5th A",
  },
  {
    id: "9",
    day: "Thursday",
    startTime: "08:00",
    endTime: "09:00",
    subject: "History-Geography",
    teacher: "Mr Bernard",
    room: "Room 103",
    class: "5th A",
  },
  {
    id: "10",
    day: "Friday",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Mathematics",
    teacher: "Mr Dubois",
    room: "Room 101",
    class: "5th A",
  },
  {
    id: "11",
    day: "Friday",
    startTime: "09:00",
    endTime: "10:00",
    subject: "Sciences",
    teacher: "Mrs Petit",
    room: "Lab 1",
    class: "5th A",
  },
]

export const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Parent-Teacher Meeting",
    content: "The parent-teacher meeting will take place on June 28th at 6:00 PM in the auditorium. Please confirm your attendance.",
    author: "Management",
    date: "2024-06-20",
    priority: "high",
    targetAudience: "parents",
    read: false,
  },
  {
    id: "2",
    title: "Schedule Changes",
    content: "Classes on Friday, June 30th will end at 3:00 PM due to the school party.",
    author: "Administration",
    date: "2024-06-22",
    priority: "medium",
    targetAudience: "all",
    read: true,
  },
  {
    id: "3",
    title: "New Digital Library",
    content: "A new digital library is now available for all students. Log in with your usual credentials.",
    author: "Mrs Dupont",
    date: "2024-06-23",
    priority: "low",
    targetAudience: "students",
    read: true,
  },
  {
    id: "4",
    title: "Pedagogical Training",
    content: "Mandatory training on new teaching methods on July 2nd at 2:00 PM.",
    author: "Management",
    date: "2024-06-24",
    priority: "high",
    targetAudience: "teachers",
    read: false,
  },
]
