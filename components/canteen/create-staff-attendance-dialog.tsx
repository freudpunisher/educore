"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    account: z.number({ required_error: "Staff account is required" }),
    meal: z.number({ required_error: "Meal is required" }),
    status: z.enum(["present", "absent", "excused"]).default("present"),
    notes: z.string().optional(),
});

type StaffAttendanceFormValues = z.infer<typeof formSchema>;

type StaffAttendanceRecord = Partial<Omit<StaffAttendanceFormValues, "account">> & {
    id: number;
    account?: number | null;
};

export function CreateStaffAttendanceDialog({
    meals,
    onSuccess,
    record,
    open: controlledOpen,
    onOpenChange,
}: {
    meals: { id: number; date: string; description?: string; mealTypeName?: string }[];
    onSuccess: () => void;
    record?: StaffAttendanceRecord | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [accounts, setAccounts] = useState<
        { id: number; user: { first_name: string; last_name: string; username: string } }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = (nextOpen: boolean) => {
        onOpenChange?.(nextOpen);
        if (controlledOpen === undefined) {
            setInternalOpen(nextOpen);
        }
    };

    const form = useForm<StaffAttendanceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "present",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            // Need an endpoint to fetch staff accounts. 
            // In educore, usually 'users/accounts/' or 'users/staff/' 
            // We saw parents endpoint earlier, let's try getting all accounts and filtering for staff, or just accounts.
            api.get<any>("users/accounts/").then((res) => {
                setAccounts(Array.isArray(res) ? res : res.results || []);
            }).catch(err => console.error("Error fetching accounts:", err));
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        form.reset({
            account: record?.account ?? undefined,
            meal: record?.meal ?? undefined,
            status: record?.status ?? "present",
            notes: record?.notes ?? "",
        });
    }, [form, open, record]);

    async function onSubmit(values: StaffAttendanceFormValues) {
        try {
            setIsLoading(true);
            if (record?.id) {
                await api.patch(`food/attendance/${record.id}/`, values);
                toast.success("Staff attendance updated");
            } else {
                await api.post("food/attendance/", values);
                toast.success("Staff attendance recorded");
            }
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error: any) {
            console.error("Form Errors:", error);
            const msg = typeof error?.response?.data === 'string' ? error.response.data : error?.response?.data?.detail || "Failed to record attendance";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {controlledOpen === undefined && (
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Record Staff Attendance
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{record?.id ? "Edit Staff Meal Attendance" : "Staff Meal Attendance"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="account"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Staff Member</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select staff" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                                    {acc.user.first_name} {acc.user.last_name} ({acc.user.username})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="meal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meal</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select meal" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {meals.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.date} - {m.mealTypeName} {m.description ? `(${m.description})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="present">Present (Consumed)</SelectItem>
                                            <SelectItem value="absent">Absent</SelectItem>
                                            <SelectItem value="excused">Excused</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any notes regarding this attendance" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? "Saving..." : record?.id ? "Update Attendance" : "Save Attendance"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
