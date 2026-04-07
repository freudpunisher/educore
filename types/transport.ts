import { z } from "zod";
import { createPaginatedSchema } from "./api";

export enum VehicleSimpleStatusEnum {
    Active = "active",
    Inactive = "inactive",
    Maintenance = "maintenance",
}

export const vehicleSimpleSchema = z.object({
    id: z.number(),
    registration: z.string(),
    model: z.string(),
    capacity: z.number(),
    status: z.nativeEnum(VehicleSimpleStatusEnum),
});

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
    vehicule: z.number(),
    vehicle_detail: vehicleSimpleSchema,
    registration_number: z.string(),
    fees: z.number(),
    fees_label: z.string(),
    state: z.boolean().optional(),
});

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
    reference: z.string(),
    student: z.number(),
    student_name: z.string(),
    student_enrollment: z.string(),
    itinerary: z.number(),
    itinerary_detail: itinerarySchema,
    period: z.number(),
    enrollment_date: z.string().transform((str) => new Date(str)),
    status: z.nativeEnum(TransportStatusEnum).optional(),
});

export type TransportSubscription = z.infer<typeof transportSubscriptionSchema>;

export const paginatedTransportSubscriptionSchema = createPaginatedSchema(transportSubscriptionSchema);

export type TransportSubscriptionsListResponse = z.infer<typeof paginatedTransportSubscriptionSchema>;
