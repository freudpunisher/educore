// Mock data for Transport Module
// Realistic school transport scenarios

export interface Subscription {
  id: number;
  studentName: string;
  studentId: string;
  route: string;
  status: "active" | "inactive";
  startDate: string;
  renewalDate: string;
  monthlyFee: number;
  class: string;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  type: "Bus" | "Minibus" | "Van";
  capacity: number;
  status: "active" | "inactive" | "maintenance";
  lastServiceDate: string;
  nextServiceDate: string;
  assignedDriver: string;
  driverPhone: string;
  purchaseDate: string;
}

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  assignedVehicle: string;
  plateNumber: string;
  status: "active" | "inactive";
  phone: string;
  email: string;
  hireDate: string;
}

export interface Itinerary {
  id: number;
  routeName: string;
  routeCode: string;
  assignedVehicle: string;
  plateNumber: string;
  assignedDriver: string;
  departureTime: string;
  estimatedDuration: string;
  stops: string[];
  studentCount: number;
}

export interface VerificationCheck {
  id: number;
  vehicleId: number;
  plateNumber: string;
  dateChecked: string;
  inspectionItems: InspectionItem[];
  status: "pass" | "fail";
  inspectedBy: string;
  notes: string;
}

export interface InspectionItem {
  name: string;
  status: "pass" | "fail";
}

// Mock Subscriptions Data
export const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    studentName: "Amara Johnson",
    studentId: "STU001",
    route: "Route A - North District",
    status: "active",
    startDate: "2025-09-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "9A",
  },
  {
    id: 2,
    studentName: "Elena Rodriguez",
    studentId: "STU002",
    route: "Route B - West Side",
    status: "active",
    startDate: "2025-09-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "10B",
  },
  {
    id: 3,
    studentName: "Marcus Chen",
    studentId: "STU003",
    route: "Route C - East Valley",
    status: "active",
    startDate: "2025-09-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "9C",
  },
  {
    id: 4,
    studentName: "Sophie Bernard",
    studentId: "STU004",
    route: "Route A - North District",
    status: "inactive",
    startDate: "2025-09-01",
    renewalDate: "2026-02-28",
    monthlyFee: 50,
    class: "11A",
  },
  {
    id: 5,
    studentName: "David Okafor",
    studentId: "STU005",
    route: "Route B - West Side",
    status: "active",
    startDate: "2025-09-15",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "9B",
  },
  {
    id: 6,
    studentName: "Yuki Tanaka",
    studentId: "STU006",
    route: "Route D - South Park",
    status: "active",
    startDate: "2025-10-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "10A",
  },
  {
    id: 7,
    studentName: "Maria Santos",
    studentId: "STU007",
    route: "Route C - East Valley",
    status: "active",
    startDate: "2025-09-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "9D",
  },
  {
    id: 8,
    studentName: "James Mitchell",
    studentId: "STU008",
    route: "Route A - North District",
    status: "inactive",
    startDate: "2025-09-01",
    renewalDate: "2026-01-31",
    monthlyFee: 50,
    class: "12C",
  },
  {
    id: 9,
    studentName: "Fatima Al-Rashid",
    studentId: "STU009",
    route: "Route D - South Park",
    status: "active",
    startDate: "2025-09-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "10C",
  },
  {
    id: 10,
    studentName: "Lucas Pereira",
    studentId: "STU010",
    route: "Route B - West Side",
    status: "active",
    startDate: "2025-09-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "11B",
  },
  {
    id: 11,
    studentName: "Priya Patel",
    studentId: "STU011",
    route: "Route C - East Valley",
    status: "active",
    startDate: "2025-09-20",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "9E",
  },
  {
    id: 12,
    studentName: "Ahmed Hassan",
    studentId: "STU012",
    route: "Route A - North District",
    status: "active",
    startDate: "2025-09-01",
    renewalDate: "2026-06-30",
    monthlyFee: 50,
    class: "10D",
  },
];

// Mock Vehicles Data
export const mockVehicles: Vehicle[] = [
  {
    id: 1,
    plateNumber: "BUS-001",
    type: "Bus",
    capacity: 50,
    status: "active",
    lastServiceDate: "2026-03-15",
    nextServiceDate: "2026-06-15",
    assignedDriver: "Robert Johnson",
    driverPhone: "+1-555-0101",
    purchaseDate: "2020-05-10",
  },
  {
    id: 2,
    plateNumber: "BUS-002",
    type: "Bus",
    capacity: 50,
    status: "active",
    lastServiceDate: "2026-02-28",
    nextServiceDate: "2026-05-28",
    assignedDriver: "Maria Garcia",
    driverPhone: "+1-555-0102",
    purchaseDate: "2021-03-20",
  },
  {
    id: 3,
    plateNumber: "BUS-003",
    type: "Bus",
    capacity: 50,
    status: "maintenance",
    lastServiceDate: "2026-03-10",
    nextServiceDate: "2026-04-10",
    assignedDriver: "John Williams",
    driverPhone: "+1-555-0103",
    purchaseDate: "2019-07-15",
  },
  {
    id: 4,
    plateNumber: "VAN-001",
    type: "Minibus",
    capacity: 30,
    status: "active",
    lastServiceDate: "2026-03-20",
    nextServiceDate: "2026-06-20",
    assignedDriver: "Susan Martinez",
    driverPhone: "+1-555-0104",
    purchaseDate: "2022-01-10",
  },
  {
    id: 5,
    plateNumber: "VAN-002",
    type: "Van",
    capacity: 20,
    status: "inactive",
    lastServiceDate: "2025-12-15",
    nextServiceDate: "2026-03-15",
    assignedDriver: "Unassigned",
    driverPhone: "N/A",
    purchaseDate: "2018-09-05",
  },
  {
    id: 6,
    plateNumber: "BUS-004",
    type: "Bus",
    capacity: 50,
    status: "active",
    lastServiceDate: "2026-03-01",
    nextServiceDate: "2026-06-01",
    assignedDriver: "Thomas Anderson",
    driverPhone: "+1-555-0105",
    purchaseDate: "2021-11-20",
  },
];

// Mock Drivers Data
export const mockDrivers: Driver[] = [
  {
    id: 1,
    name: "Robert Johnson",
    licenseNumber: "DL-2020-001",
    assignedVehicle: "BUS-001",
    plateNumber: "BUS-001",
    status: "active",
    phone: "+1-555-0101",
    email: "robert.johnson@school.edu",
    hireDate: "2020-06-01",
  },
  {
    id: 2,
    name: "Maria Garcia",
    licenseNumber: "DL-2021-002",
    assignedVehicle: "BUS-002",
    plateNumber: "BUS-002",
    status: "active",
    phone: "+1-555-0102",
    email: "maria.garcia@school.edu",
    hireDate: "2021-04-15",
  },
  {
    id: 3,
    name: "John Williams",
    licenseNumber: "DL-2019-003",
    assignedVehicle: "BUS-003",
    plateNumber: "BUS-003",
    status: "inactive",
    phone: "+1-555-0103",
    email: "john.williams@school.edu",
    hireDate: "2019-08-10",
  },
  {
    id: 4,
    name: "Susan Martinez",
    licenseNumber: "DL-2022-004",
    assignedVehicle: "VAN-001",
    plateNumber: "VAN-001",
    status: "active",
    phone: "+1-555-0104",
    email: "susan.martinez@school.edu",
    hireDate: "2022-02-01",
  },
  {
    id: 5,
    name: "Thomas Anderson",
    licenseNumber: "DL-2021-005",
    assignedVehicle: "BUS-004",
    plateNumber: "BUS-004",
    status: "active",
    phone: "+1-555-0105",
    email: "thomas.anderson@school.edu",
    hireDate: "2021-12-01",
  },
];

// Mock Itineraries Data
export const mockItineraries: Itinerary[] = [
  {
    id: 1,
    routeName: "Route A - North District",
    routeCode: "RTA-001",
    assignedVehicle: "BUS-001",
    plateNumber: "BUS-001",
    assignedDriver: "Robert Johnson",
    departureTime: "06:45 AM",
    estimatedDuration: "45 minutes",
    stops: [
      "Central Station",
      "North Park",
      "Highland Avenue",
      "School Main Gate",
    ],
    studentCount: 32,
  },
  {
    id: 2,
    routeName: "Route B - West Side",
    routeCode: "RTB-002",
    assignedVehicle: "BUS-002",
    plateNumber: "BUS-002",
    assignedDriver: "Maria Garcia",
    departureTime: "07:00 AM",
    estimatedDuration: "50 minutes",
    stops: [
      "West Terminal",
      "Commerce Street",
      "Pine Road",
      "Market Square",
      "School Main Gate",
    ],
    studentCount: 28,
  },
  {
    id: 3,
    routeName: "Route C - East Valley",
    routeCode: "RTC-003",
    assignedVehicle: "VAN-001",
    plateNumber: "VAN-001",
    assignedDriver: "Susan Martinez",
    departureTime: "07:15 AM",
    estimatedDuration: "40 minutes",
    stops: ["Valley Station", "East Ridge", "Forest Road", "School Main Gate"],
    studentCount: 18,
  },
  {
    id: 4,
    routeName: "Route D - South Park",
    routeCode: "RTD-004",
    assignedVehicle: "BUS-004",
    plateNumber: "BUS-004",
    assignedDriver: "Thomas Anderson",
    departureTime: "06:30 AM",
    estimatedDuration: "55 minutes",
    stops: [
      "South Terminal",
      "Park Avenue",
      "Garden Street",
      "Riverside Road",
      "School Main Gate",
    ],
    studentCount: 35,
  },
];

// Mock Verification Checks Data
export const mockVerificationChecks: VerificationCheck[] = [
  {
    id: 1,
    vehicleId: 1,
    plateNumber: "BUS-001",
    dateChecked: "2026-03-30",
    inspectionItems: [
      { name: "Brakes", status: "pass" },
      { name: "Lights", status: "pass" },
      { name: "Tires", status: "pass" },
      { name: "Wipers", status: "pass" },
      { name: "Horn", status: "pass" },
      { name: "Emergency Exit", status: "pass" },
      { name: "Seatbelts", status: "pass" },
      { name: "Fire Extinguisher", status: "pass" },
    ],
    status: "pass",
    inspectedBy: "Safety Officer - Alex",
    notes: "All systems operational. No issues found.",
  },
  {
    id: 2,
    vehicleId: 2,
    plateNumber: "BUS-002",
    dateChecked: "2026-03-29",
    inspectionItems: [
      { name: "Brakes", status: "pass" },
      { name: "Lights", status: "fail" },
      { name: "Tires", status: "pass" },
      { name: "Wipers", status: "pass" },
      { name: "Horn", status: "pass" },
      { name: "Emergency Exit", status: "pass" },
      { name: "Seatbelts", status: "pass" },
      { name: "Fire Extinguisher", status: "pass" },
    ],
    status: "fail",
    inspectedBy: "Safety Officer - Beth",
    notes: "Right side light not functioning. Repair scheduled.",
  },
  {
    id: 3,
    vehicleId: 4,
    plateNumber: "VAN-001",
    dateChecked: "2026-03-30",
    inspectionItems: [
      { name: "Brakes", status: "pass" },
      { name: "Lights", status: "pass" },
      { name: "Tires", status: "pass" },
      { name: "Wipers", status: "pass" },
      { name: "Horn", status: "pass" },
      { name: "Emergency Exit", status: "pass" },
      { name: "Seatbelts", status: "pass" },
      { name: "Fire Extinguisher", status: "pass" },
    ],
    status: "pass",
    inspectedBy: "Safety Officer - Charlie",
    notes: "Vehicle in excellent condition.",
  },
  {
    id: 4,
    vehicleId: 6,
    plateNumber: "BUS-004",
    dateChecked: "2026-03-28",
    inspectionItems: [
      { name: "Brakes", status: "pass" },
      { name: "Lights", status: "pass" },
      { name: "Tires", status: "fail" },
      { name: "Wipers", status: "pass" },
      { name: "Horn", status: "pass" },
      { name: "Emergency Exit", status: "pass" },
      { name: "Seatbelts", status: "pass" },
      { name: "Fire Extinguisher", status: "pass" },
    ],
    status: "fail",
    inspectedBy: "Safety Officer - David",
    notes: "Front left tire shows wear. Replacement needed soon.",
  },
];

// Dashboard KPI Data
export interface DashboardKPI {
  subscriptionsTotal: number;
  subscriptionsActive: number;
  subscriptionsInactive: number;
  subscriptionsTrend: number; // percentage change
  vehiclesTotal: number;
  vehiclesActive: number;
  vehiclesInactive: number;
  vehiclesMaintenance: number;
  driversTotal: number;
  driversActive: number;
  driversInactive: number;
  itinerariesTotal: number;
}

export const mockDashboardKPI: DashboardKPI = {
  subscriptionsTotal: 12,
  subscriptionsActive: 10,
  subscriptionsInactive: 2,
  subscriptionsTrend: 8.3, // +8.3% vs previous quarter
  vehiclesTotal: 6,
  vehiclesActive: 4,
  vehiclesInactive: 1,
  vehiclesMaintenance: 1,
  driversTotal: 5,
  driversActive: 4,
  driversInactive: 1,
  itinerariesTotal: 4,
};
