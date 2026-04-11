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
    dietary_restriction: z.enum([
        "none",
        "vegetarian",
        "vegan",
        "halal",
        "kosher",
        "gluten_free",
    ]),
    preferred_meal_plan: z.number().optional().nullable(),
    allergies: z.string().optional(),
});

export function CreatePreferenceDialog({
    mealPlans,
    onSuccess
}: {
    mealPlans: { id: number, name: string }[],
    onSuccess: () => void
}) {
    const [open, setOpen] = useState(false);
    const [students, setStudents] = useState<{ id: number, full_name: string, enrollment_number: string }[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dietary_restriction: "none",
            allergies: "",
        },
    });

    useEffect(() => {
        if (open) {
            api.get<any>("users/students/").then((res) => {
                setStudents(Array.isArray(res) ? res : res.results || []);
            });
        }
    }, [open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await api.post("food/student-preferences/", values);
            toast.success("Preference added successfully");
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            toast.error("Failed to add preference");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Preference
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Student Preference</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form Errors:", errors))}
                        className="space-y-4"
                    >
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
                            name="dietary_restriction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dietary Restriction</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select restriction" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                            <SelectItem value="vegan">Vegan</SelectItem>
                                            <SelectItem value="halal">Halal</SelectItem>
                                            <SelectItem value="kosher">Kosher</SelectItem>
                                            <SelectItem value="gluten_free">Gluten Free</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferred_meal_plan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Meal Plan</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))}
                                        defaultValue={field.value?.toString() || "none"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select plan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
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
                            name="allergies"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Allergies</FormLabel>
                                    <FormControl>
                                        <Input placeholder="List allergies" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Save Preference</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
