// Mock data for School Store Module
// Realistic school store inventory and transaction scenarios

export interface StoreItem {
  id: number;
  name: string;
  category: "stationary" | "uniform" | "books" | "electronics" | "sports" | "miscellaneous";
  description: string;
  price: number;
  quantity: number;
  minStockLevel: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
}

export interface StudentPurchase {
  id: number;
  studentId: string;
  studentName: string;
  class: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  paymentMethod: "cash" | "card" | "account";
  paymentStatus: "paid" | "pending";
}

export interface StoreTransaction {
  id: number;
  transactionDate: string;
  type: "sale" | "restock" | "adjustment" | "damage";
  itemName: string;
  quantity: number;
  amount: number;
  reference: string;
  notes: string;
}

export interface Supplier {
  id: number;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  lastSupplyDate: string;
  status: "active" | "inactive";
}

export interface StoreDashboardKPI {
  totalItems: number;
  lowStockItems: number;
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  outOfStockItems: number;
  pendingOrders: number;
  supplierCount: number;
}

// Mock Store Items Data
export const mockStoreItems: StoreItem[] = [
  {
    id: 1,
    name: "Ballpoint Pen (Blue) - Pack of 50",
    category: "stationary",
    description: "Blue ballpoint pens, bulk pack",
    price: 12.5,
    quantity: 150,
    minStockLevel: 50,
    supplier: "Office Supply Co",
    lastRestocked: "2026-03-25",
  },
  {
    id: 2,
    name: "Notebook A4 (100 pages)",
    category: "stationary",
    description: "Lined A4 notebooks",
    price: 3.5,
    quantity: 200,
    minStockLevel: 75,
    supplier: "Paper Products Ltd",
    lastRestocked: "2026-03-20",
  },
  {
    id: 3,
    name: "School Uniform - Shirt (Size M)",
    category: "uniform",
    description: "White school uniform shirt, medium size",
    price: 25.0,
    quantity: 45,
    minStockLevel: 20,
    supplier: "Uniform Manufacturers Inc",
    lastRestocked: "2026-02-15",
  },
  {
    id: 4,
    name: "School Uniform - Pants (Size M)",
    category: "uniform",
    description: "Navy school uniform pants, medium size",
    price: 35.0,
    quantity: 30,
    minStockLevel: 15,
    supplier: "Uniform Manufacturers Inc",
    lastRestocked: "2026-02-15",
  },
  {
    id: 5,
    name: "Mathematics Textbook (Grade 10)",
    category: "books",
    description: "Official mathematics textbook for grade 10",
    price: 45.0,
    quantity: 22,
    minStockLevel: 10,
    supplier: "Educational Publishers Group",
    lastRestocked: "2026-01-30",
  },
  {
    id: 6,
    name: "Scientific Calculator",
    category: "electronics",
    description: "Advanced scientific calculator with 240 functions",
    price: 28.5,
    quantity: 18,
    minStockLevel: 8,
    supplier: "TechCalc Electronics",
    lastRestocked: "2026-03-10",
  },
  {
    id: 7,
    name: "USB Flash Drive 32GB",
    category: "electronics",
    description: "32GB USB 3.0 flash drive",
    price: 15.0,
    quantity: 5,
    minStockLevel: 10,
    supplier: "TechCalc Electronics",
    lastRestocked: "2026-03-01",
  },
  {
    id: 8,
    name: "School Sports Kit",
    category: "sports",
    description: "Complete PE class sports kit",
    price: 55.0,
    quantity: 12,
    minStockLevel: 5,
    supplier: "Sports Equipment Plus",
    lastRestocked: "2026-02-28",
  },
  {
    id: 9,
    name: "Highlighter Markers (Set of 6)",
    category: "stationary",
    description: "Assorted color highlighter markers",
    price: 4.5,
    quantity: 85,
    minStockLevel: 30,
    supplier: "Office Supply Co",
    lastRestocked: "2026-03-22",
  },
  {
    id: 10,
    name: "Ruler 30cm",
    category: "stationary",
    description: "Clear plastic 30cm ruler",
    price: 1.5,
    quantity: 120,
    minStockLevel: 40,
    supplier: "Office Supply Co",
    lastRestocked: "2026-03-24",
  },
];

// Mock Student Purchases Data
export const mockStudentPurchases: StudentPurchase[] = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Amara Johnson",
    class: "9A",
    itemId: 1,
    itemName: "Ballpoint Pen (Blue) - Pack of 50",
    quantity: 1,
    unitPrice: 12.5,
    totalPrice: 12.5,
    purchaseDate: "2026-03-30",
    paymentMethod: "cash",
    paymentStatus: "paid",
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Elena Rodriguez",
    class: "10B",
    itemId: 2,
    itemName: "Notebook A4 (100 pages)",
    quantity: 3,
    unitPrice: 3.5,
    totalPrice: 10.5,
    purchaseDate: "2026-03-30",
    paymentMethod: "card",
    paymentStatus: "paid",
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Marcus Chen",
    class: "9C",
    itemId: 6,
    itemName: "Scientific Calculator",
    quantity: 1,
    unitPrice: 28.5,
    totalPrice: 28.5,
    purchaseDate: "2026-03-29",
    paymentMethod: "account",
    paymentStatus: "pending",
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Sophie Bernard",
    class: "11A",
    itemId: 3,
    itemName: "School Uniform - Shirt (Size M)",
    quantity: 2,
    unitPrice: 25.0,
    totalPrice: 50.0,
    purchaseDate: "2026-03-28",
    paymentMethod: "card",
    paymentStatus: "paid",
  },
  {
    id: 5,
    studentId: "STU005",
    studentName: "David Okafor",
    class: "9B",
    itemId: 9,
    itemName: "Highlighter Markers (Set of 6)",
    quantity: 2,
    unitPrice: 4.5,
    totalPrice: 9.0,
    purchaseDate: "2026-03-30",
    paymentMethod: "cash",
    paymentStatus: "paid",
  },
  {
    id: 6,
    studentId: "STU006",
    studentName: "Yuki Tanaka",
    class: "10A",
    itemId: 5,
    itemName: "Mathematics Textbook (Grade 10)",
    quantity: 1,
    unitPrice: 45.0,
    totalPrice: 45.0,
    purchaseDate: "2026-03-25",
    paymentMethod: "account",
    paymentStatus: "pending",
  },
  {
    id: 7,
    studentId: "STU007",
    studentName: "Maria Santos",
    class: "9D",
    itemId: 1,
    itemName: "Ballpoint Pen (Blue) - Pack of 50",
    quantity: 1,
    unitPrice: 12.5,
    totalPrice: 12.5,
    purchaseDate: "2026-03-30",
    paymentMethod: "cash",
    paymentStatus: "paid",
  },
  {
    id: 8,
    studentId: "STU008",
    studentName: "James Wilson",
    class: "10C",
    itemId: 8,
    itemName: "School Sports Kit",
    quantity: 1,
    unitPrice: 55.0,
    totalPrice: 55.0,
    purchaseDate: "2026-03-27",
    paymentMethod: "card",
    paymentStatus: "paid",
  },
];

// Mock Store Transactions Data
export const mockStoreTransactions: StoreTransaction[] = [
  {
    id: 1,
    transactionDate: "2026-03-30",
    type: "sale",
    itemName: "Ballpoint Pen (Blue) - Pack of 50",
    quantity: 2,
    amount: 25.0,
    reference: "SALE-001",
    notes: "Direct sales to students",
  },
  {
    id: 2,
    transactionDate: "2026-03-30",
    type: "sale",
    itemName: "Notebook A4 (100 pages)",
    quantity: 3,
    amount: 10.5,
    reference: "SALE-002",
    notes: "Student purchase",
  },
  {
    id: 3,
    transactionDate: "2026-03-29",
    type: "restock",
    itemName: "Highlighter Markers (Set of 6)",
    quantity: 50,
    amount: 225.0,
    reference: "RESTOCK-001",
    notes: "Stock replenishment from Office Supply Co",
  },
  {
    id: 4,
    transactionDate: "2026-03-28",
    type: "sale",
    itemName: "School Uniform - Shirt (Size M)",
    quantity: 2,
    amount: 50.0,
    reference: "SALE-003",
    notes: "Uniform sales",
  },
  {
    id: 5,
    transactionDate: "2026-03-27",
    type: "sale",
    itemName: "School Sports Kit",
    quantity: 1,
    amount: 55.0,
    reference: "SALE-004",
    notes: "PE equipment purchase",
  },
  {
    id: 6,
    transactionDate: "2026-03-26",
    type: "adjustment",
    itemName: "Ruler 30cm",
    quantity: -5,
    amount: 0,
    reference: "ADJ-001",
    notes: "Inventory correction - damaged items",
  },
  {
    id: 7,
    transactionDate: "2026-03-25",
    type: "restock",
    itemName: "Mathematics Textbook (Grade 10)",
    quantity: 15,
    amount: 675.0,
    reference: "RESTOCK-002",
    notes: "Textbook restocking for new semester",
  },
];

// Mock Suppliers Data
export const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Office Supply Co",
    category: "Stationary",
    contactPerson: "John Smith",
    email: "john@officesupply.com",
    phone: "+1-555-0201",
    address: "123 Business Ave, Commerce City",
    paymentTerms: "Net 30",
    lastSupplyDate: "2026-03-24",
    status: "active",
  },
  {
    id: 2,
    name: "Uniform Manufacturers Inc",
    category: "School Uniforms",
    contactPerson: "Maria Garcia",
    email: "maria@uniforms.com",
    phone: "+1-555-0202",
    address: "456 Factory Lane, Production Park",
    paymentTerms: "Net 45",
    lastSupplyDate: "2026-02-15",
    status: "active",
  },
  {
    id: 3,
    name: "Educational Publishers Group",
    category: "Books & Textbooks",
    contactPerson: "Dr. Robert Lee",
    email: "robert@edpublishers.com",
    phone: "+1-555-0203",
    address: "789 Publishing Plaza, Education Hub",
    paymentTerms: "Net 60",
    lastSupplyDate: "2026-01-30",
    status: "active",
  },
  {
    id: 4,
    name: "TechCalc Electronics",
    category: "Electronics & Technology",
    contactPerson: "Alex Chen",
    email: "alex@techcalc.com",
    phone: "+1-555-0204",
    address: "321 Tech Street, Innovation Zone",
    paymentTerms: "Net 30",
    lastSupplyDate: "2026-03-10",
    status: "active",
  },
  {
    id: 5,
    name: "Paper Products Ltd",
    category: "Stationary & Paper",
    contactPerson: "Sarah Williams",
    email: "sarah@paperproducts.com",
    phone: "+1-555-0205",
    address: "654 Mill Road, Industrial Area",
    paymentTerms: "Net 15",
    lastSupplyDate: "2026-03-20",
    status: "active",
  },
  {
    id: 6,
    name: "Sports Equipment Plus",
    category: "Sports & PE Equipment",
    contactPerson: "Coach Michael",
    email: "michael@sportsequip.com",
    phone: "+1-555-0206",
    address: "987 Athletic Drive, Sports Complex",
    paymentTerms: "Net 30",
    lastSupplyDate: "2026-02-28",
    status: "inactive",
  },
];

// Dashboard KPI data
export const mockStoreDashboardKPI: StoreDashboardKPI = {
  totalItems: 10,
  lowStockItems: 2,
  totalRevenue: 258.5,
  totalTransactions: 7,
  averageTransactionValue: 36.93,
  outOfStockItems: 1,
  pendingOrders: 2,
  supplierCount: 6,
};
