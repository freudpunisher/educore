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
