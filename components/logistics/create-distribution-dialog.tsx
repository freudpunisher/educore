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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
    product: z.number({ required_error: "Product is required" }),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    recipient_type: z.enum(["staff", "student", "department", "service", "other"]),
    recipient_id: z.number().min(1, "ID is required"),
    recipient_name: z.string().min(1, "Name is required"),
    status: z.enum(["active", "returned", "damaged"]).default("active"),
    notes: z.string().optional(),
    expected_return_date: z.string().optional().nullable(),
});

export function CreateDistributionDialog({
    products,
    onSuccess,
}: {
    products: { id: number; name: string }[];
    onSuccess: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: 1,
            recipient_type: "staff",
            status: "active",
            recipient_name: "",
            notes: "",
            expected_return_date: null,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);
            await api.post("store/stock/non-vivres/", values);
            toast.success("Distribution recorded successfully");
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error: any) {
            toast.error(error?.response?.data?.detail || "Failed to record distribution");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                    <Plus className="w-4 h-4" /> New Distribution
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Equipment (Non-Food Items)</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="product"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equipment / Item</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select item" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="recipient_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipient Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="staff">Personnel</SelectItem>
                                                <SelectItem value="student">Étudiant</SelectItem>
                                                <SelectItem value="department">Département</SelectItem>
                                                <SelectItem value="service">Service</SelectItem>
                                                <SelectItem value="other">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="recipient_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipient Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="recipient_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID Code</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="returned">Returned</SelectItem>
                                                <SelectItem value="damaged">Damaged</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expected_return_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Return Date (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Optional details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Distribution"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
