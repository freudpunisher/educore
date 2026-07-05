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
    meal: z.number({ required_error: "Meal plan is required" }),
    status: z.enum(["present", "absent", "excused"]).default("present"),
    notes: z.string().optional(),
});

type StaffAttendanceFormValues = z.infer<typeof formSchema>;

type StaffAttendanceRecord = Partial<Omit<StaffAttendanceFormValues, "account">> & {
    id: number;
    account?: number | null;
    meal?: number | null;
    meal_info?: { name: string; description: string; monthly_cost: string } | null;
};

export function CreateStaffAttendanceDialog({
    meals,
    mealPlans = [],
    onSuccess,
    record,
    open: controlledOpen,
    onOpenChange,
}: {
    meals: { id: number; date: string; description?: string; mealTypeName?: string; meal_type_detail?: { name: string } | null; fees_detail?: { id: number; label: string; amount: string } | null }[];
    mealPlans?: { id: number; name: string; monthly_cost: number | string }[];
    onSuccess: () => void;
    record?: StaffAttendanceRecord | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [accounts, setAccounts] = useState<
        { id: number; user: { first_name: string; last_name: string; username: string }; role?: string }[]
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
            api.get<any>("users/accounts/").then((res) => {
                const allAccounts = Array.isArray(res) ? res : res.results || [];
                // Exclude students, parents, and superadmins
                const staffAccounts = allAccounts.filter(
                    (acc: any) => acc.role !== "student" && acc.role !== "student_parent" && acc.role !== "system_admin"
                );
                setAccounts(staffAccounts);
            }).catch(err => console.error("Error fetching accounts:", err));
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        if (record?.id) {
            form.reset({
                account: record?.account ?? undefined,
                meal: undefined,
                status: record?.status ?? "present",
                notes: record?.notes ?? "",
            });
        } else {
            form.reset({
                account: undefined,
                meal: undefined,
                status: "present",
                notes: "",
            });
        }
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
            const data = error?.response?.data;
            console.error("Response data (full):", JSON.stringify(data, null, 2));
            let msg = "Failed to record attendance";
            if (typeof data === "string") {
                msg = data;
            } else if (data?.detail) {
                msg = data.detail;
            } else if (data?.message) {
                msg = data.message;
            } else if (data?.errors && typeof data.errors === "object") {
                const err = Object.values(data.errors).flat().filter(Boolean)[0];
                if (err) msg = String(err);
            } else if (typeof data === "object") {
                const err = Object.values(data).flat().filter(Boolean)[0];
                if (err) msg = String(err);
            }
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

                        {record?.id ? (
                            <FormItem>
                                <FormLabel>Meal Plan</FormLabel>
                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                                    {record.meal_info
                                        ? `${record.meal_info.name} - BIF ${Number(record.meal_info.monthly_cost || 0).toFixed(0)}`
                                        : "Plan #" + record.meal}
                                </div>
                            </FormItem>
                        ) : (
                        <FormField
                            control={form.control}
                            name="meal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meal Plan</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select meal plan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {mealPlans.map((mp) => (
                                                <SelectItem key={mp.id} value={mp.id.toString()}>
                                                    {mp.name} - BIF {Number(mp.monthly_cost || 0).toFixed(0)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        )}

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
