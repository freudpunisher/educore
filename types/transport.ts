import { z } from "zod";
import { createPaginatedSchema } from "./api";

export enum VehicleSimpleStatusEnum {
    Active = "active",
    Inactive = "inactive",
    Maintenance = "maintenance",
}

export const vehicleSimpleSchema = z.object({
    id: z.number(),
    registration: z.string().optional(),
    model: z.string().optional(),
    capacity: z.number().optional(),
    status: z.string().optional(),
}).passthrough();

export type VehicleSimple = z.infer<typeof vehicleSimpleSchema>;

export const vehicleCreateSchema = z.object({
    registration: z.string().min(1, "Registration is required"),
    model: z.string().min(1, "Model is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    status: z.nativeEnum(VehicleSimpleStatusEnum).default(VehicleSimpleStatusEnum.Active),
});

export type VehicleCreate = z.infer<typeof vehicleCreateSchema>;

export const paginatedTransportVehicleSchema = createPaginatedSchema(vehicleSimpleSchema);

export type TransportVehicleListResponse = z.infer<typeof paginatedTransportVehicleSchema>;

export const driverSchema = z.object({
    id: z.number(),
    user: z.number(),
    user_name: z.string(),
    vehicle: z.number().nullable().optional(),
    vehicle_name: z.string().optional(), // Adding this for potential UI use
    phone: z.string().optional(),
    status: z.string().optional(),
});

export type Driver = z.infer<typeof driverSchema>;

export const paginatedTransportDriverSchema = createPaginatedSchema(driverSchema);

export type TransportDriverListResponse = z.infer<typeof paginatedTransportDriverSchema>;

export const itinerarySchema = z.object({
    id: z.number(),
    vehicule: z.number().optional(),
    vehicle_detail: vehicleSimpleSchema.optional().nullable(),
    registration_number: z.string().optional(),
    fees: z.number().optional(),
    fees_label: z.string().optional(),
    state: z.boolean().optional(),
}).passthrough();

export type Itinerary = z.infer<typeof itinerarySchema>;

export const paginatedTransportItinerarySchema = createPaginatedSchema(itinerarySchema);

export type TransportItineraryListResponse = z.infer<typeof paginatedTransportItinerarySchema>;

export enum TransportStatusEnum {
    Active = "active",
    Inactive = "inactive",
    Suspended = "suspended",
}

export const transportSubscriptionSchema = z.object({
    id: z.number(),
    reference: z.string().optional().nullable(),
    student: z.number().optional(),
    student_name: z.string().optional().nullable(),
    student_enrollment: z.string().optional().nullable(),
    itinerary: z.number().optional(),
    itinerary_detail: itinerarySchema.optional().nullable(),
    period: z.number().optional(),
    enrollment_date: z.union([z.string(), z.date()]).optional().transform((val) => val ? new Date(val) : new Date()),
    status: z.string().optional().nullable(),
}).passthrough();

export type TransportSubscription = z.infer<typeof transportSubscriptionSchema>;

export const paginatedTransportSubscriptionSchema = createPaginatedSchema(transportSubscriptionSchema);

export type TransportSubscriptionsListResponse = z.infer<typeof paginatedTransportSubscriptionSchema>;

export const transportSubscriptionCreateSchema = z.object({
    student: z.number().min(1, "Student is required"),
    itinerary: z.number().min(1, "Route is required"),
    period: z.number().min(1, "Period is required"),
    enrollment_date: z.string().min(1, "Enrollment date is required"),
    reference: z.string().optional(),
    status: z.nativeEnum(TransportStatusEnum).default(TransportStatusEnum.Active),
});

export type TransportSubscriptionCreate = z.infer<typeof transportSubscriptionCreateSchema>;
export const transportDashboardStatsSchema = z.object({
    subscriptions: z.object({
        active: z.number().default(0),
        inactive: z.number().default(0),
    }),
    vehicles: z.object({
        active: z.number().default(0),
        maintenance: z.number().default(0),
        inactive: z.number().default(0),
    }),
    drivers: z.object({
        total: z.number().default(0),
    }),
    itineraries: z.number().default(0),
    today_checkins: z.number().default(0),
}).passthrough();

export type TransportDashboardStats = z.infer<typeof transportDashboardStatsSchema>;

export const transportCheckInSchema = z.object({
    id: z.number(),
    checked_at: z.string().or(z.date()),
    checked_by: z.number().nullable().optional(),
    itinerary: z.number(),
    status: z.boolean().optional(),
    student: z.number(),
    student_name: z.string(),
    transport: z.number(),
    vehicle: z.number().nullable().optional(),
}).passthrough();

export type TransportCheckIn = z.infer<typeof transportCheckInSchema>;

export const transportCheckInListSchema = z.object({
    count: z.number(),
    next: z.string().nullable().optional(),
    previous: z.string().nullable().optional(),
    results: z.array(transportCheckInSchema),
}).passthrough();

export type TransportCheckInList = z.infer<typeof transportCheckInListSchema>;
