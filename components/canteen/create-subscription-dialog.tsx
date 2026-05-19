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
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    student: z.number({ required_error: "Student is required" }),
    meal_plan: z.number({ required_error: "Meal plan is required" }),
    period_category: z.number({ required_error: "Period category is required" }),
    status: z.enum(["active", "paused", "expired", "cancelled"]).default("active"),
    start_date: z.string(),
});

type SubscriptionFormValues = z.infer<typeof formSchema>;

type SubscriptionRecord = Partial<SubscriptionFormValues> & {
    id: number;
    student_name?: string;
};

export function CreateSubscriptionDialog({
    mealPlans,
    onSuccess,
    record,
    open: controlledOpen,
    onOpenChange,
}: {
    mealPlans: any[];
    onSuccess: () => void;
    record?: SubscriptionRecord | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [students, setStudents] = useState<
        { id: number; full_name: string; enrollment_number: string }[]
    >([]);
    const open = controlledOpen ?? internalOpen;
    const setOpen = (nextOpen: boolean) => {
        onOpenChange?.(nextOpen);
        if (controlledOpen === undefined) {
            setInternalOpen(nextOpen);
        }
    };

    const form = useForm<SubscriptionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "active",
            start_date: new Date().toISOString().split("T")[0],
            period_category: 1, // Monthly by default
        },
    });

    useEffect(() => {
        if (open) {
            api.get<any>("users/students/").then((res) => {
                setStudents(Array.isArray(res) ? res : res.results || []);
            });
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        form.reset({
            student: record?.student,
            meal_plan: record?.meal_plan,
            period_category: record?.period_category ?? 1,
            status: record?.status ?? "active",
            start_date: record?.start_date ?? new Date().toISOString().split("T")[0],
        });
    }, [form, open, record]);

    async function onSubmit(values: SubscriptionFormValues) {
        try {
            if (record?.id) {
                await api.patch(`food/subscriptions/${record.id}/`, values);
                toast.success("Subscription updated successfully");
            } else {
                await api.post("food/subscriptions/", values);
                toast.success("Subscription created successfully");
            }
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            toast.error(record?.id ? "Failed to update subscription" : "Failed to create subscription");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {controlledOpen === undefined && (
                <DialogTrigger asChild>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Order
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{record?.id ? "Edit Meal Order" : "Create New Meal Order"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="student"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Student (Auto-complete)</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? students.find(
                                                                  (student) => student.id === field.value
                                                              )?.full_name || record?.student_name
                                                            : "Search student..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search student name or enrollment..." />
                                                    <CommandList>
                                                        <CommandEmpty>No student found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {students.map((student) => (
                                                                <CommandItem
                                                                    value={`${student.full_name} ${student.enrollment_number}`}
                                                                    key={student.id}
                                                                    onSelect={() => {
                                                                        form.setValue("student", student.id);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            student.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {student.full_name} ({student.enrollment_number})
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="meal_plan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Meal Plan</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value?.toString()}
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
                                <FormField
                                    control={form.control}
                                    name="period_category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Period Category</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select period" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Monthly</SelectItem>
                                                    <SelectItem value="2">Quarterly</SelectItem>
                                                    <SelectItem value="3">Semiannually</SelectItem>
                                                    <SelectItem value="4">Annually</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
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
                        </div>


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
                            {record?.id ? "Update Subscription" : "Create Subscription"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
