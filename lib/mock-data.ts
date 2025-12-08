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
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi"
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
    class: "5ème A",
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
    class: "4ème B",
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
    class: "5ème A",
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
    class: "6ème C",
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
    class: "4ème A",
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
    class: "5ème B",
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
    description: "Frais de scolarité - Juin 2024",
  },
  {
    id: "INV-002",
    studentId: "2",
    studentName: "Lucas Dubois",
    amount: 450,
    dueDate: "2024-06-30",
    status: "pending",
    type: "tuition",
    description: "Frais de scolarité - Juin 2024",
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
    description: "Transport scolaire - Juin 2024",
  },
  {
    id: "INV-004",
    studentId: "4",
    studentName: "Thomas Petit",
    amount: 450,
    dueDate: "2024-05-30",
    status: "overdue",
    type: "tuition",
    description: "Frais de scolarité - Mai 2024",
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
    description: "Cantine - Juin 2024",
  },
]

export const mockExpenses: Expense[] = [
  {
    id: "EXP-001",
    date: "2024-06-15",
    category: "Fournitures",
    description: "Achat de livres scolaires",
    amount: 2500,
    paymentMethod: "Virement",
    status: "approved",
  },
  {
    id: "EXP-002",
    date: "2024-06-20",
    category: "Maintenance",
    description: "Réparation climatisation",
    amount: 850,
    paymentMethod: "Chèque",
    status: "approved",
  },
  {
    id: "EXP-003",
    date: "2024-06-25",
    category: "Salaires",
    description: "Salaires enseignants - Juin",
    amount: 15000,
    paymentMethod: "Virement",
    status: "pending",
  },
  {
    id: "EXP-004",
    date: "2024-06-10",
    category: "Utilities",
    description: "Facture électricité",
    amount: 450,
    paymentMethod: "Prélèvement",
    status: "approved",
  },
]

export const mockClasses: Class[] = [
  {
    id: "1",
    name: "6ème A",
    level: "6ème",
    teacher: "Mme Dupont",
    studentCount: 28,
    schedule: "Lun-Ven 8h-16h",
  },
  {
    id: "2",
    name: "6ème B",
    level: "6ème",
    teacher: "M. Laurent",
    studentCount: 25,
    schedule: "Lun-Ven 8h-16h",
  },
  {
    id: "3",
    name: "5ème A",
    level: "5ème",
    teacher: "Mme Bernard",
    studentCount: 30,
    schedule: "Lun-Ven 8h-16h",
  },
  {
    id: "4",
    name: "5ème B",
    level: "5ème",
    teacher: "M. Petit",
    studentCount: 27,
    schedule: "Lun-Ven 8h-16h",
  },
  {
    id: "5",
    name: "4ème A",
    level: "4ème",
    teacher: "Mme Roux",
    studentCount: 26,
    schedule: "Lun-Ven 8h-16h",
  },
  {
    id: "6",
    name: "4ème B",
    level: "4ème",
    teacher: "M. Moreau",
    studentCount: 29,
    schedule: "Lun-Ven 8h-16h",
  },
]

export const mockCourses: Course[] = [
  {
    id: "1",
    name: "Mathématiques",
    teacher: "M. Dubois",
    class: "5ème A",
    schedule: "Lun, Mer, Ven 9h-10h",
    room: "Salle 101",
    duration: "1h",
  },
  {
    id: "2",
    name: "Français",
    teacher: "Mme Martin",
    class: "5ème A",
    schedule: "Mar, Jeu 10h-11h",
    room: "Salle 102",
    duration: "1h",
  },
  {
    id: "3",
    name: "Histoire-Géographie",
    teacher: "M. Bernard",
    class: "5ème A",
    schedule: "Lun, Jeu 14h-15h",
    room: "Salle 103",
    duration: "1h",
  },
  {
    id: "4",
    name: "Sciences",
    teacher: "Mme Petit",
    class: "5ème A",
    schedule: "Mar, Ven 11h-12h",
    room: "Labo 1",
    duration: "1h",
  },
  {
    id: "5",
    name: "Anglais",
    teacher: "Mme Roux",
    class: "5ème A",
    schedule: "Lun, Mer 11h-12h",
    room: "Salle 104",
    duration: "1h",
  },
]

export const mockGrades: Grade[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "Sophie Martin",
    course: "Mathématiques",
    grade: 16,
    maxGrade: 20,
    date: "2024-06-15",
    type: "exam",
  },
  {
    id: "2",
    studentId: "1",
    studentName: "Sophie Martin",
    course: "Français",
    grade: 14,
    maxGrade: 20,
    date: "2024-06-18",
    type: "homework",
  },
  {
    id: "3",
    studentId: "2",
    studentName: "Lucas Dubois",
    course: "Mathématiques",
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
    course: "Anglais",
    grade: 15,
    maxGrade: 20,
    date: "2024-06-22",
    type: "exam",
  },
]

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Vacances d'été",
    description: "Vacances scolaires d'été",
    date: "2024-07-06",
    endDate: "2024-09-02",
    type: "holiday",
  },
  {
    id: "2",
    title: "Examen de Mathématiques",
    description: "Examen final de mathématiques pour les 5ème",
    date: "2024-06-25",
    type: "exam",
    location: "Salle 101",
  },
  {
    id: "3",
    title: "Réunion parents-professeurs",
    description: "Rencontre trimestrielle avec les parents",
    date: "2024-06-28",
    type: "meeting",
    location: "Auditorium",
  },
  {
    id: "4",
    title: "Fête de l'école",
    description: "Célébration de fin d'année",
    date: "2024-06-30",
    type: "event",
    location: "Cour de récréation",
  },
  {
    id: "5",
    title: "Conseil pédagogique",
    description: "Réunion du conseil pédagogique",
    date: "2024-07-02",
    type: "meeting",
    location: "Salle des professeurs",
    participants: ["Enseignants", "Direction"],
  },
]

export const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "Sophie Martin",
    class: "5ème A",
    date: "2024-06-24",
    status: "present",
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Lucas Dubois",
    class: "4ème B",
    date: "2024-06-24",
    status: "absent",
    notes: "Malade",
  },
  {
    id: "3",
    studentId: "3",
    studentName: "Emma Bernard",
    class: "5ème A",
    date: "2024-06-24",
    status: "present",
  },
  {
    id: "4",
    studentId: "4",
    studentName: "Thomas Petit",
    class: "6ème C",
    date: "2024-06-24",
    status: "late",
    notes: "Arrivé à 8h15",
  },
  {
    id: "5",
    studentId: "5",
    studentName: "Léa Roux",
    class: "4ème A",
    date: "2024-06-24",
    status: "present",
  },
  {
    id: "6",
    studentId: "1",
    studentName: "Sophie Martin",
    class: "5ème A",
    date: "2024-06-25",
    status: "present",
  },
  {
    id: "7",
    studentId: "2",
    studentName: "Lucas Dubois",
    class: "4ème B",
    date: "2024-06-25",
    status: "excused",
    notes: "Rendez-vous médical",
  },
]

export const mockTimetable: TimetableSlot[] = [
  {
    id: "1",
    day: "Lundi",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Mathématiques",
    teacher: "M. Dubois",
    room: "Salle 101",
    class: "5ème A",
  },
  {
    id: "2",
    day: "Lundi",
    startTime: "09:00",
    endTime: "10:00",
    subject: "Français",
    teacher: "Mme Martin",
    room: "Salle 102",
    class: "5ème A",
  },
  {
    id: "3",
    day: "Lundi",
    startTime: "10:15",
    endTime: "11:15",
    subject: "Anglais",
    teacher: "Mme Roux",
    room: "Salle 104",
    class: "5ème A",
  },
  {
    id: "4",
    day: "Lundi",
    startTime: "11:15",
    endTime: "12:15",
    subject: "Histoire-Géographie",
    teacher: "M. Bernard",
    room: "Salle 103",
    class: "5ème A",
  },
  {
    id: "5",
    day: "Mardi",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Sciences",
    teacher: "Mme Petit",
    room: "Labo 1",
    class: "5ème A",
  },
  {
    id: "6",
    day: "Mardi",
    startTime: "09:00",
    endTime: "10:00",
    subject: "Français",
    teacher: "Mme Martin",
    room: "Salle 102",
    class: "5ème A",
  },
  {
    id: "7",
    day: "Mercredi",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Mathématiques",
    teacher: "M. Dubois",
    room: "Salle 101",
    class: "5ème A",
  },
  {
    id: "8",
    day: "Mercredi",
    startTime: "09:00",
    endTime: "10:00",
    subject: "Anglais",
    teacher: "Mme Roux",
    room: "Salle 104",
    class: "5ème A",
  },
  {
    id: "9",
    day: "Jeudi",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Histoire-Géographie",
    teacher: "M. Bernard",
    room: "Salle 103",
    class: "5ème A",
  },
  {
    id: "10",
    day: "Vendredi",
    startTime: "08:00",
    endTime: "09:00",
    subject: "Mathématiques",
    teacher: "M. Dubois",
    room: "Salle 101",
    class: "5ème A",
  },
  {
    id: "11",
    day: "Vendredi",
    startTime: "09:00",
    endTime: "10:00",
    subject: "Sciences",
    teacher: "Mme Petit",
    room: "Labo 1",
    class: "5ème A",
  },
]

export const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Réunion parents-professeurs",
    content:
      "La réunion parents-professeurs aura lieu le 28 juin à 18h dans l'auditorium. Merci de confirmer votre présence.",
    author: "Direction",
    date: "2024-06-20",
    priority: "high",
    targetAudience: "parents",
    read: false,
  },
  {
    id: "2",
    title: "Modification des horaires",
    content: "Les cours du vendredi 30 juin se termineront à 15h en raison de la fête de l'école.",
    author: "Administration",
    date: "2024-06-22",
    priority: "medium",
    targetAudience: "all",
    read: true,
  },
  {
    id: "3",
    title: "Nouvelle bibliothèque numérique",
    content:
      "Une nouvelle bibliothèque numérique est maintenant disponible pour tous les élèves. Connectez-vous avec vos identifiants habituels.",
    author: "Mme Dupont",
    date: "2024-06-23",
    priority: "low",
    targetAudience: "students",
    read: true,
  },
  {
    id: "4",
    title: "Formation pédagogique",
    content: "Formation obligatoire sur les nouvelles méthodes d'enseignement le 2 juillet à 14h.",
    author: "Direction",
    date: "2024-06-24",
    priority: "high",
    targetAudience: "teachers",
    read: false,
  },
]
