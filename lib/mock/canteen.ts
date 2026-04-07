// Mock data for Canteen Module
// Realistic school meal management scenarios

export interface MealPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  mealCount: number;
  dietaryType: "standard" | "vegetarian" | "vegan" | "halal";
  gradeLevel: string;
  active: boolean;
  createdDate: string;
}

export interface MealItem {
  id: number;
  name: string;
  category: "main" | "side" | "beverage" | "dessert" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  allergens: string[];
  cost: number;
  availableToday: boolean;
}

export interface StudentMealPreference {
  id: number;
  studentId: string;
  studentName: string;
  class: string;
  dietaryRestriction: "none" | "vegetarian" | "vegan" | "halal" | "gluten-free" | "nut-allergy";
  preferredMealPlan: string;
  allergies: string[];
  notes: string;
}

export interface MealOrder {
  id: number;
  studentId: string;
  studentName: string;
  class: string;
  mealPlan: string;
  orderDate: string;
  servingDate: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "served" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
}

export interface CanteenDashboardKPI {
  mealsServedToday: number;
  mealItemsAvailable: number;
  totalRevenue: number;
  activeOrders: number;
  totalOrders: number;
  averageOrderValue: number;
  vegetarianPercentage: number;
  peakMealTime: string;
}

// Mock Meal Plans Data
export const mockMealPlans: MealPlan[] = [
  {
    id: 1,
    name: "Standard Daily Plan",
    description: "Complete lunch with main, side, beverage, and dessert",
    price: 8.5,
    mealCount: 20,
    dietaryType: "standard",
    gradeLevel: "All Grades",
    active: true,
    createdDate: "2025-09-01",
  },
  {
    id: 2,
    name: "Vegetarian Plan",
    description: "Balanced vegetarian meals with plant-based proteins",
    price: 8.0,
    mealCount: 12,
    dietaryType: "vegetarian",
    gradeLevel: "All Grades",
    active: true,
    createdDate: "2025-09-01",
  },
  {
    id: 3,
    name: "Premium Deluxe Plan",
    description: "Enhanced meals with premium ingredients and larger portions",
    price: 12.0,
    mealCount: 8,
    dietaryType: "standard",
    gradeLevel: "9-12",
    active: true,
    createdDate: "2025-10-15",
  },
  {
    id: 4,
    name: "Vegan Plan",
    description: "Fully plant-based nutritious meals",
    price: 8.5,
    mealCount: 6,
    dietaryType: "vegan",
    gradeLevel: "All Grades",
    active: true,
    createdDate: "2025-11-01",
  },
  {
    id: 5,
    name: "Light Snack Plan",
    description: "Morning snack and light lunch option",
    price: 4.5,
    mealCount: 15,
    dietaryType: "standard",
    gradeLevel: "6-8",
    active: true,
    createdDate: "2025-09-15",
  },
  {
    id: 6,
    name: "Halal Certified Plan",
    description: "Certified halal meals prepared with respect to dietary laws",
    price: 9.0,
    mealCount: 5,
    dietaryType: "halal",
    gradeLevel: "All Grades",
    active: true,
    createdDate: "2026-01-10",
  },
];

// Mock Meal Items Data
export const mockMealItems: MealItem[] = [
  {
    id: 1,
    name: "Grilled Chicken Breast",
    category: "main",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    allergens: [],
    cost: 2.5,
    availableToday: true,
  },
  {
    id: 2,
    name: "Vegetable Stir Fry",
    category: "side",
    calories: 95,
    protein: 3,
    carbs: 18,
    fat: 2,
    allergens: [],
    cost: 1.2,
    availableToday: true,
  },
  {
    id: 3,
    name: "Brown Rice",
    category: "side",
    calories: 215,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    allergens: [],
    cost: 0.8,
    availableToday: true,
  },
  {
    id: 4,
    name: "Fresh Orange Juice",
    category: "beverage",
    calories: 110,
    protein: 2,
    carbs: 26,
    fat: 0.5,
    allergens: [],
    cost: 1.0,
    availableToday: true,
  },
  {
    id: 5,
    name: "Chocolate Chip Cookie",
    category: "dessert",
    calories: 210,
    protein: 2.5,
    carbs: 29,
    fat: 10,
    allergens: ["peanut", "dairy"],
    cost: 0.75,
    availableToday: true,
  },
  {
    id: 6,
    name: "Lentil Soup",
    category: "main",
    calories: 180,
    protein: 9,
    carbs: 28,
    fat: 2,
    allergens: [],
    cost: 1.5,
    availableToday: false,
  },
  {
    id: 7,
    name: "Greek Salad",
    category: "side",
    calories: 150,
    protein: 6,
    carbs: 12,
    fat: 8,
    allergens: ["dairy"],
    cost: 1.8,
    availableToday: true,
  },
  {
    id: 8,
    name: "Fruit Smoothie",
    category: "beverage",
    calories: 140,
    protein: 3,
    carbs: 32,
    fat: 0.5,
    allergens: [],
    cost: 1.5,
    availableToday: true,
  },
  {
    id: 9,
    name: "Grilled Fish Fillet",
    category: "main",
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 12,
    allergens: ["fish"],
    cost: 3.0,
    availableToday: true,
  },
  {
    id: 10,
    name: "Seasonal Fruit Cup",
    category: "dessert",
    calories: 80,
    protein: 1,
    carbs: 20,
    fat: 0,
    allergens: [],
    cost: 1.2,
    availableToday: true,
  },
  {
    id: 11,
    name: "Vegetable Sandwich",
    category: "snack",
    calories: 220,
    protein: 8,
    carbs: 35,
    fat: 5,
    allergens: ["gluten", "dairy"],
    cost: 1.8,
    availableToday: true,
  },
  {
    id: 12,
    name: "Tofu Steak",
    category: "main",
    calories: 145,
    protein: 20,
    carbs: 2,
    fat: 6,
    allergens: ["soy"],
    cost: 2.0,
    availableToday: true,
  },
];

// Mock Student Meal Preferences Data
export const mockStudentPreferences: StudentMealPreference[] = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Amara Johnson",
    class: "9A",
    dietaryRestriction: "none",
    preferredMealPlan: "Standard Daily Plan",
    allergies: [],
    notes: "Prefers extra vegetables",
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Elena Rodriguez",
    class: "10B",
    dietaryRestriction: "vegetarian",
    preferredMealPlan: "Vegetarian Plan",
    allergies: ["dairy"],
    notes: "Lactose intolerant",
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Marcus Chen",
    class: "9C",
    dietaryRestriction: "none",
    preferredMealPlan: "Standard Daily Plan",
    allergies: [],
    notes: "",
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Sophie Bernard",
    class: "11A",
    dietaryRestriction: "vegan",
    preferredMealPlan: "Vegan Plan",
    allergies: ["peanut", "tree nuts"],
    notes: "Nut-free preparation required",
  },
  {
    id: 5,
    studentId: "STU005",
    studentName: "David Okafor",
    class: "9B",
    dietaryRestriction: "halal",
    preferredMealPlan: "Halal Certified Plan",
    allergies: [],
    notes: "Halal certified meals only",
  },
  {
    id: 6,
    studentId: "STU006",
    studentName: "Yuki Tanaka",
    class: "10A",
    dietaryRestriction: "none",
    preferredMealPlan: "Premium Deluxe Plan",
    allergies: ["fish"],
    notes: "Fish and shellfish allergy",
  },
  {
    id: 7,
    studentId: "STU007",
    studentName: "Maria Santos",
    class: "9D",
    dietaryRestriction: "vegetarian",
    preferredMealPlan: "Vegetarian Plan",
    allergies: [],
    notes: "Prefers gluten-free options when available",
  },
  {
    id: 8,
    studentId: "STU008",
    studentName: "James Wilson",
    class: "10C",
    dietaryRestriction: "none",
    preferredMealPlan: "Standard Daily Plan",
    allergies: ["peanut"],
    notes: "Severe peanut allergy - cross-contamination risk",
  },
];

// Mock Meal Orders Data
export const mockMealOrders: MealOrder[] = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Amara Johnson",
    class: "9A",
    mealPlan: "Standard Daily Plan",
    orderDate: "2026-03-30",
    servingDate: "2026-03-31",
    quantity: 1,
    totalPrice: 8.5,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Elena Rodriguez",
    class: "10B",
    mealPlan: "Vegetarian Plan",
    orderDate: "2026-03-30",
    servingDate: "2026-03-31",
    quantity: 1,
    totalPrice: 8.0,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Marcus Chen",
    class: "9C",
    mealPlan: "Standard Daily Plan",
    orderDate: "2026-03-30",
    servingDate: "2026-03-31",
    quantity: 1,
    totalPrice: 8.5,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Sophie Bernard",
    class: "11A",
    mealPlan: "Vegan Plan",
    orderDate: "2026-03-30",
    servingDate: "2026-03-31",
    quantity: 1,
    totalPrice: 8.5,
    status: "pending",
    paymentStatus: "pending",
  },
  {
    id: 5,
    studentId: "STU005",
    studentName: "David Okafor",
    class: "9B",
    mealPlan: "Halal Certified Plan",
    orderDate: "2026-03-30",
    servingDate: "2026-03-31",
    quantity: 1,
    totalPrice: 9.0,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: 6,
    studentId: "STU006",
    studentName: "Yuki Tanaka",
    class: "10A",
    mealPlan: "Premium Deluxe Plan",
    orderDate: "2026-03-30",
    servingDate: "2026-03-31",
    quantity: 1,
    totalPrice: 12.0,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: 7,
    studentId: "STU007",
    studentName: "Maria Santos",
    class: "9D",
    mealPlan: "Vegetarian Plan",
    orderDate: "2026-03-29",
    servingDate: "2026-03-30",
    quantity: 1,
    totalPrice: 8.0,
    status: "served",
    paymentStatus: "paid",
  },
  {
    id: 8,
    studentId: "STU008",
    studentName: "James Wilson",
    class: "10C",
    mealPlan: "Standard Daily Plan",
    orderDate: "2026-03-30",
    servingDate: "2026-03-31",
    quantity: 1,
    totalPrice: 8.5,
    status: "cancelled",
    paymentStatus: "refunded",
  },
  {
    id: 9,
    studentId: "STU001",
    studentName: "Amara Johnson",
    class: "9A",
    mealPlan: "Standard Daily Plan",
    orderDate: "2026-03-29",
    servingDate: "2026-03-30",
    quantity: 1,
    totalPrice: 8.5,
    status: "served",
    paymentStatus: "paid",
  },
  {
    id: 10,
    studentId: "STU002",
    studentName: "Elena Rodriguez",
    class: "10B",
    mealPlan: "Vegetarian Plan",
    orderDate: "2026-03-29",
    servingDate: "2026-03-30",
    quantity: 1,
    totalPrice: 8.0,
    status: "served",
    paymentStatus: "paid",
  },
];

// Dashboard KPI data
export const mockCanteenDashboardKPI: CanteenDashboardKPI = {
  mealsServedToday: 142,
  mealItemsAvailable: 11,
  totalRevenue: 1285.5,
  activeOrders: 5,
  totalOrders: 10,
  averageOrderValue: 8.68,
  vegetarianPercentage: 35,
  peakMealTime: "12:30 PM - 1:15 PM",
};
