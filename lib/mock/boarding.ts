// Mock data for Student Boarding Module
// Realistic school boarding house management scenarios

export interface DormAssignment {
  id: number;
  studentId: string;
  studentName: string;
  class: string;
  roomNumber: string;
  dormBlock: string;
  checkInDate: string;
  checkOutDate?: string;
  status: "active" | "checkout-pending" | "archived";
  boardingFee: number;
  feeStatus: "paid" | "partially-paid" | "pending";
}

export interface DormRoom {
  id: number;
  roomNumber: string;
  dormBlock: string;
  capacity: number;
  occupancy: number;
  amenities: string[];
  condition: "excellent" | "good" | "fair" | "needs-repair";
  maintenanceNotes?: string;
  costPerBed: number;
}

export interface BoardingFee {
  id: number;
  studentId: string;
  studentName: string;
  class: string;
  termNumber: number;
  academicYear: string;
  totalFee: number;
  amountPaid: number;
  dueDate: string;
  paymentStatus: "paid" | "partially-paid" | "pending" | "overdue";
}

export interface VisitorLog {
  id: number;
  studentName: string;
  visitorName: string;
  visitorRelation: string;
  visitDate: string;
  checkInTime: string;
  checkOutTime: string;
  duration: string;
  purpose: string;
}

export interface RoomCondition {
  id: number;
  roomNumber: string;
  dormBlock: string;
  inspectionDate: string;
  condition: "excellent" | "good" | "fair" | "needs-repair";
  issues: string[];
  inspectedBy: string;
  actionRequired: boolean;
  notes: string;
}

export interface BoardingDashboardKPI {
  totalStudents: number;
  occupancyRate: number;
  totalRevenue: number;
  totalRooms: number;
  availableBeds: number;
  maintenanceIssues: number;
  pendingPayments: number;
  visitorsThisMonth: number;
}

// Mock Dorm Assignments Data
export const mockDormAssignments: DormAssignment[] = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Amara Johnson",
    class: "9A",
    roomNumber: "A101",
    dormBlock: "Block A",
    checkInDate: "2026-01-15",
    status: "active",
    boardingFee: 2500,
    feeStatus: "paid",
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Elena Rodriguez",
    class: "10B",
    roomNumber: "A102",
    dormBlock: "Block A",
    checkInDate: "2026-01-15",
    status: "active",
    boardingFee: 2500,
    feeStatus: "paid",
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Marcus Chen",
    class: "9C",
    roomNumber: "B203",
    dormBlock: "Block B",
    checkInDate: "2026-01-15",
    status: "active",
    boardingFee: 2500,
    feeStatus: "partially-paid",
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Sophie Bernard",
    class: "11A",
    roomNumber: "C305",
    dormBlock: "Block C",
    checkInDate: "2026-01-15",
    status: "active",
    boardingFee: 2500,
    feeStatus: "paid",
  },
  {
    id: 5,
    studentId: "STU005",
    studentName: "David Okafor",
    class: "9B",
    roomNumber: "A103",
    dormBlock: "Block A",
    checkInDate: "2026-02-10",
    status: "active",
    boardingFee: 2500,
    feeStatus: "pending",
  },
  {
    id: 6,
    studentId: "STU006",
    studentName: "Yuki Tanaka",
    class: "10A",
    roomNumber: "B204",
    dormBlock: "Block B",
    checkInDate: "2026-01-15",
    status: "active",
    boardingFee: 2500,
    feeStatus: "paid",
  },
  {
    id: 7,
    studentId: "STU007",
    studentName: "Maria Santos",
    class: "9D",
    roomNumber: "C306",
    dormBlock: "Block C",
    checkInDate: "2026-01-15",
    status: "checkout-pending",
    boardingFee: 2500,
    feeStatus: "paid",
    checkOutDate: "2026-04-10",
  },
  {
    id: 8,
    studentId: "STU008",
    studentName: "James Wilson",
    class: "10C",
    roomNumber: "A104",
    dormBlock: "Block A",
    checkInDate: "2026-01-20",
    status: "active",
    boardingFee: 2500,
    feeStatus: "paid",
  },
];

// Mock Dorm Rooms Data
export const mockDormRooms: DormRoom[] = [
  {
    id: 1,
    roomNumber: "A101",
    dormBlock: "Block A",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "excellent",
    costPerBed: 1250,
  },
  {
    id: 2,
    roomNumber: "A102",
    dormBlock: "Block A",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "good",
    costPerBed: 1250,
  },
  {
    id: 3,
    roomNumber: "A103",
    dormBlock: "Block A",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "excellent",
    costPerBed: 1250,
  },
  {
    id: 4,
    roomNumber: "A104",
    dormBlock: "Block A",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "good",
    costPerBed: 1250,
  },
  {
    id: 5,
    roomNumber: "B203",
    dormBlock: "Block B",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "fair",
    maintenanceNotes: "Window needs repair",
    costPerBed: 1250,
  },
  {
    id: 6,
    roomNumber: "B204",
    dormBlock: "Block B",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "good",
    costPerBed: 1250,
  },
  {
    id: 7,
    roomNumber: "C305",
    dormBlock: "Block C",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "excellent",
    costPerBed: 1250,
  },
  {
    id: 8,
    roomNumber: "C306",
    dormBlock: "Block C",
    capacity: 2,
    occupancy: 1,
    amenities: ["Bed", "Desk", "Closet", "Shared Bathroom"],
    condition: "needs-repair",
    maintenanceNotes: "Door lock broken, AC not working",
    costPerBed: 1250,
  },
];

// Mock Boarding Fees Data
export const mockBoardingFees: BoardingFee[] = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Amara Johnson",
    class: "9A",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 2500,
    dueDate: "2026-02-15",
    paymentStatus: "paid",
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Elena Rodriguez",
    class: "10B",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 2500,
    dueDate: "2026-02-15",
    paymentStatus: "paid",
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Marcus Chen",
    class: "9C",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 1250,
    dueDate: "2026-02-15",
    paymentStatus: "partially-paid",
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Sophie Bernard",
    class: "11A",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 2500,
    dueDate: "2026-02-15",
    paymentStatus: "paid",
  },
  {
    id: 5,
    studentId: "STU005",
    studentName: "David Okafor",
    class: "9B",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 0,
    dueDate: "2026-02-15",
    paymentStatus: "pending",
  },
  {
    id: 6,
    studentId: "STU006",
    studentName: "Yuki Tanaka",
    class: "10A",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 2500,
    dueDate: "2026-02-15",
    paymentStatus: "paid",
  },
  {
    id: 7,
    studentId: "STU007",
    studentName: "Maria Santos",
    class: "9D",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 2500,
    dueDate: "2026-02-15",
    paymentStatus: "paid",
  },
  {
    id: 8,
    studentId: "STU008",
    studentName: "James Wilson",
    class: "10C",
    termNumber: 1,
    academicYear: "2025-2026",
    totalFee: 2500,
    amountPaid: 0,
    dueDate: "2026-02-15",
    paymentStatus: "overdue",
  },
];

// Mock Visitor Logs Data
export const mockVisitorLogs: VisitorLog[] = [
  {
    id: 1,
    studentName: "Amara Johnson",
    visitorName: "Mrs. Sarah Johnson",
    visitorRelation: "Mother",
    visitDate: "2026-03-28",
    checkInTime: "14:00",
    checkOutTime: "16:30",
    duration: "2h 30m",
    purpose: "Family Visit",
  },
  {
    id: 2,
    studentName: "Elena Rodriguez",
    visitorName: "Mr. Carlos Rodriguez",
    visitorRelation: "Father",
    visitDate: "2026-03-27",
    checkInTime: "15:00",
    checkOutTime: "17:00",
    duration: "2h",
    purpose: "Family Visit",
  },
  {
    id: 3,
    studentName: "Marcus Chen",
    visitorName: "Mrs. Wei Chen",
    visitorRelation: "Mother",
    visitDate: "2026-03-26",
    checkInTime: "14:30",
    checkOutTime: "16:00",
    duration: "1h 30m",
    purpose: "Supplies Delivery",
  },
  {
    id: 4,
    studentName: "Sophie Bernard",
    visitorName: "Mrs. Anne Bernard",
    visitorRelation: "Mother",
    visitDate: "2026-03-25",
    checkInTime: "15:00",
    checkOutTime: "18:00",
    duration: "3h",
    purpose: "Family Visit",
  },
  {
    id: 5,
    studentName: "David Okafor",
    visitorName: "Mr. Kwame Okafor",
    visitorRelation: "Father",
    visitDate: "2026-03-24",
    checkInTime: "14:00",
    checkOutTime: "16:00",
    duration: "2h",
    purpose: "Family Visit",
  },
  {
    id: 6,
    studentName: "Yuki Tanaka",
    visitorName: "Mrs. Hiroko Tanaka",
    visitorRelation: "Mother",
    visitDate: "2026-03-23",
    checkInTime: "14:00",
    checkOutTime: "16:30",
    duration: "2h 30m",
    purpose: "Family Visit",
  },
];

// Mock Room Condition Data
export const mockRoomConditions: RoomCondition[] = [
  {
    id: 1,
    roomNumber: "A101",
    dormBlock: "Block A",
    inspectionDate: "2026-03-20",
    condition: "excellent",
    issues: [],
    inspectedBy: "Mr. James Smith",
    actionRequired: false,
    notes: "Room is clean and well-maintained",
  },
  {
    id: 2,
    roomNumber: "B203",
    dormBlock: "Block B",
    inspectionDate: "2026-03-20",
    condition: "fair",
    issues: ["Window frame loose", "Light fixture flickering"],
    inspectedBy: "Mr. James Smith",
    actionRequired: true,
    notes: "Window needs repair urgently",
  },
  {
    id: 3,
    roomNumber: "C306",
    dormBlock: "Block C",
    inspectionDate: "2026-03-19",
    condition: "needs-repair",
    issues: ["Door lock broken", "AC unit not functioning", "Wall paint peeling"],
    inspectedBy: "Mrs. Emily Davis",
    actionRequired: true,
    notes: "Multiple issues - schedule maintenance immediately",
  },
  {
    id: 4,
    roomNumber: "A104",
    dormBlock: "Block A",
    inspectionDate: "2026-03-21",
    condition: "good",
    issues: ["Minor water stain on ceiling"],
    inspectedBy: "Mr. James Smith",
    actionRequired: false,
    notes: "Monitor ceiling for water damage",
  },
];

// Dashboard KPI data
export const mockBoardingDashboardKPI: BoardingDashboardKPI = {
  totalStudents: 8,
  occupancyRate: 50,
  totalRevenue: 20000,
  totalRooms: 8,
  availableBeds: 8,
  maintenanceIssues: 2,
  pendingPayments: 2,
  visitorsThisMonth: 6,
};
