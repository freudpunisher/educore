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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
    student: z.number({ required_error: "Student is required" }),
    meal_plan: z.number({ required_error: "Meal plan is required" }),
    status: z.enum(["active", "paused", "expired", "cancelled"]).default("active"),
    start_date: z.string(),
    end_date: z.string({ required_error: "End date is required" }),
    amount_paid: z.number().min(0).default(0),
    total_amount_due: z.number().min(0),
});

export function CreateSubscriptionDialog({
    mealPlans,
    onSuccess,
}: {
    mealPlans: any[];
    onSuccess: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [students, setStudents] = useState<
        { id: number; full_name: string; enrollment_number: string }[]
    >([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "active",
            start_date: new Date().toISOString().split("T")[0],
            amount_paid: 0,
            total_amount_due: 0,
        },
    });

    const { watch, setValue } = form;
    const watchedValues = watch(["meal_plan", "start_date", "end_date", "amount_paid"]);

    useEffect(() => {
        if (open) {
            api.get<any>("users/students/").then((res) => {
                setStudents(Array.isArray(res) ? res : res.results || []);
            });
        }
    }, [open]);

    // Handle meal plan selection and automatic amount_paid setting
    useEffect(() => {
        const mealPlanId = watchedValues[0];
        if (mealPlanId) {
            const plan = mealPlans.find((p) => p.id === mealPlanId);
            if (plan) {
                const dailyRate = Number(plan.monthly_cost || 0) / 30;
                setValue("amount_paid", Math.round(dailyRate * 100) / 100);
            }
        }
    }, [watchedValues[0], mealPlans]);

    // Calculate total_amount_due automatically
    useEffect(() => {
        const [_, startDate, endDate, amountPaid] = watchedValues;
        if (startDate && endDate && amountPaid) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
            if (diffDays > 0) {
                setValue("total_amount_due", Math.round(diffDays * amountPaid * 100) / 100);
            }
        }
    }, [watchedValues[1], watchedValues[2], watchedValues[3]]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await api.post("food/subscriptions/", values);
            toast.success("Subscription created successfully");
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            toast.error("Failed to create subscription");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Meal Order</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="student"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Student</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select student" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {students.map((s) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                        {s.full_name} ({s.enrollment_number})
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
                                name="meal_plan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meal Plan</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select plan" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {mealPlans.map((p) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount_paid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Daily Rate / Amount ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="total_amount_due"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Due ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paused">Paused</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Create Subscription
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
