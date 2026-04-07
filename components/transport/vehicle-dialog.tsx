"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useCreateVehicle,
    useUpdateVehicle
} from "@/hooks/use-transport";
import {
    vehicleCreateSchema,
    VehicleSimpleStatusEnum,
    VehicleSimple
} from "@/types/transport";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    record?: VehicleSimple | null;
}

export function VehicleDialog({
    isOpen,
    onClose,
    record,
}: VehicleDialogProps) {
    const isEditing = !!record;
    const createMutation = useCreateVehicle();
    const updateMutation = useUpdateVehicle();

    const form = useForm({
        resolver: zodResolver(vehicleCreateSchema),
        defaultValues: {
            registration: "",
            model: "",
            capacity: 0,
            status: VehicleSimpleStatusEnum.Active,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (record) {
                form.reset({
                    registration: record.registration,
                    model: record.model,
                    capacity: record.capacity,
                    status: record.status,
                });
            } else {
                form.reset({
                    registration: "",
                    model: "",
                    capacity: 0,
                    status: VehicleSimpleStatusEnum.Active,
                });
            }
        }
    }, [record, isOpen, form]);

    const onSubmit = async (data: any) => {
        try {
            if (isEditing) {
                await updateMutation.mutateAsync({ id: record!.id, data });
                toast.success("Vehicle updated successfully!");
            } else {
                await createMutation.mutateAsync(data);
                toast.success("Vehicle created successfully!");
            }
            onClose();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} vehicle`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the details of the selected vehicle."
                            : "Enter the details for the new fleet vehicle."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="registration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Registration / Plate</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. BUS-123"
                                            {...field}
                                            className="rounded-xl border-slate-200 focus:ring-blue-500 h-11"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Model / Type</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Toyota Coaster"
                                            {...field}
                                            className="rounded-xl border-slate-200 focus:ring-blue-500 h-11"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Capacity (Seats)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                            className="rounded-xl border-slate-200 focus:ring-blue-500 h-11"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700 dark:text-slate-300">Status</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500 h-11">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                <SelectItem value={VehicleSimpleStatusEnum.Active}>Active</SelectItem>
                                                <SelectItem value={VehicleSimpleStatusEnum.Inactive}>Inactive</SelectItem>
                                                <SelectItem value={VehicleSimpleStatusEnum.Maintenance}>Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-xl font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className={cn(
                                    "rounded-xl font-bold min-w-[100px] shadow-lg transition-all",
                                    isEditing ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
                                )}
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    isEditing ? "Update" : "Add Vehicle"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
