"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
    FormDescription,
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
import {
    useClassrooms,
    useStudentsByClassLevel,
    useDisciplineReasons,
    useCreateDisciplineRecord,
} from "@/hooks/use-discipline";
import { disciplineRecordCreateSchema, DisciplineRecordStatusEnum } from "@/types/discipline";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateBehaviorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateBehaviorDialog({
    isOpen,
    onClose,
    onSuccess,
}: CreateBehaviorDialogProps) {
    const [step, setStep] = useState<"class" | "student" | "details">("class");
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedClassroom, setSelectedClassroom] = useState<any>(null);

    // Queries
    const { data: classrooms, isLoading: classroomsLoading } = useClassrooms();
    const { data: students, isLoading: studentsLoading } = useStudentsByClassLevel(
        selectedClassId
    );
    const { data: reasons, isLoading: reasonsLoading } = useDisciplineReasons();
    const createMutation = useCreateDisciplineRecord();

    // Form
    const form = useForm({
        resolver: zodResolver(disciplineRecordCreateSchema),
        defaultValues: {
            student: undefined,
            date_incident: format(new Date(), "yyyy-MM-dd"),
            reason: undefined,
            description: "",
            appeal_reason: "",
            status: "recorded",
            points_deducted: "",
        },
    });

    // Watch student field for reactive updates
    const selectedStudent = form.watch("student");
    const selectedReason = form.watch("reason");

    // Auto-populate points_deducted when reason is selected
    useMemo(() => {
        if (selectedReason && reasons) {
            const reason = reasons.find((r: any) => r.id === selectedReason);
            if (reason) {
                form.setValue("points_deducted", reason.penalty_points);
            }
        }
    }, [selectedReason, reasons, form]);

    const [studentSearch, setStudentSearch] = useState("");
    const [reasonSearch, setReasonSearch] = useState("");

    // Filter students and reasons based on search
    const filteredStudents = useMemo(() => {
        if (!students) return [];
        return students.filter((s: any) =>
            s.student_name.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [students, studentSearch]);

    const filteredReasons = useMemo(() => {
        if (!reasons) return [];
        return reasons.filter((r: any) =>
            r.name.toLowerCase().includes(reasonSearch.toLowerCase())
        );
    }, [reasons, reasonSearch]);

    const handleClassSelect = (classroomId: number, classroom: any) => {
        setSelectedClassId(classroomId);
        setSelectedClassroom(classroom);
        form.setValue("student", undefined);
        setStep("student");
    };

    const handleStudentSelect = () => {
        if (form.getValues("student")) {
            setStep("details");
        }
    };

    const onSubmit = async (data: any) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success("Discipline record created successfully!");
            form.reset();
            setSelectedClassId(null);
            setSelectedClassroom(null);
            setStep("class");
            onClose();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to create discipline record");
        }
    };

    const handleClose = () => {
        form.reset();
        setSelectedClassId(null);
        setSelectedClassroom(null);
        setStep("class");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{maxWidth:"100vh"}}>
                <DialogHeader className="bg-gradient-to-r from-rose-500 to-rose-600 -m-6 mb-6 p-6 text-white rounded-t-lg">
                    <DialogTitle className="text-2xl font-bold">
                        Add Discipline Record
                    </DialogTitle>
                    <DialogDescription className="text-rose-100 mt-2">
                        {step === "class" && "Step 1: Select a classroom"}
                        {step === "student" && "Step 2: Select a student"}
                        {step === "details" && "Step 3: Enter incident details"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
                        {/* STEP 1: CLASS SELECTION */}
                        {step === "class" && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-700">
                                        Select a class to view and manage students in that class.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                                    {classroomsLoading ? (
                                        <div className="col-span-2 flex justify-center items-center h-32">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : classrooms && classrooms.length > 0 ? (
                                        classrooms.map((classroom: any) => (
                                            <button
                                                key={classroom.id}
                                                type="button"
                                                onClick={() => handleClassSelect(classroom.id, classroom)}
                                                className="p-3 rounded-lg border-2 border-transparent hover:border-rose-300 hover:bg-rose-50 transition-all text-left"
                                            >
                                                <p className="font-semibold text-sm">{classroom.name}</p>
                                                <p className="text-xs text-muted-foreground">{classroom.code}</p>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="col-span-2 text-center text-muted-foreground py-8">
                                            No classrooms available
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: STUDENT SELECTION */}
                        {step === "student" && (
                            <div className="space-y-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">Class Selected</p>
                                        <p className="text-sm text-amber-700">{selectedClassroom?.name}</p>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="student"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value ? String(field.value) : ""}
                                                    onValueChange={(value) =>
                                                        field.onChange(parseInt(value))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <div className="p-2 border-b sticky top-0 bg-white z-50">
                                                            <Input
                                                                placeholder="Search students..."
                                                                value={studentSearch}
                                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                                className="h-8"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        {studentsLoading ? (
                                                            <div className="flex justify-center p-4">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            </div>
                                                        ) : filteredStudents && filteredStudents.length > 0 ? (
                                                            filteredStudents.map((student: any) => (
                                                                <SelectItem
                                                                    key={student.id}
                                                                    value={String(student.student)}
                                                                >
                                                                    {student.student_name}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                                {studentSearch ? "No students match search" : "No students found"}
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedClassId(null);
                                            setSelectedClassroom(null);
                                            setStep("class");
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleStudentSelect}
                                        disabled={!selectedStudent}
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: INCIDENT DETAILS */}
                        {step === "details" && (
                            <div className="space-y-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-900">Ready to record</p>
                                        <p className="text-sm text-green-700">
                                            Enter the incident details below
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date_incident"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Incident</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discipline Reason</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value ? String(field.value) : ""}
                                                        onValueChange={(value) =>
                                                            field.onChange(parseInt(value))
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select reason" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <div className="p-2 border-b sticky top-0 bg-white z-50">
                                                                <Input
                                                                    placeholder="Search reasons..."
                                                                    value={reasonSearch}
                                                                    onChange={(e) => setReasonSearch(e.target.value)}
                                                                    className="h-8"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            {reasonsLoading ? (
                                                                <div className="flex justify-center p-4">
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                </div>
                                                            ) : filteredReasons && filteredReasons.length > 0 ? (
                                                                filteredReasons.map((reason: any) => (
                                                                    <SelectItem
                                                                        key={reason.id}
                                                                        value={String(reason.id)}
                                                                    >
                                                                        {reason.name} ({reason.penalty_points}{" "}
                                                                        pts)
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                                    {reasonSearch ? "No reasons match search" : "No reasons available"}
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Incident Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe what happened..."
                                                    className="resize-none"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Provide detailed information about the incident
                                            </FormDescription>
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
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={DisciplineRecordStatusEnum.Recorded}>
                                                            Recorded
                                                        </SelectItem>
                                                        <SelectItem value={DisciplineRecordStatusEnum.Appealed}>
                                                            Appealed
                                                        </SelectItem>
                                                        <SelectItem value={DisciplineRecordStatusEnum.Cancelled}>
                                                            Cancelled
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.getValues("status") === "appealed" && (
                                    <FormField
                                        control={form.control}
                                        name="appeal_reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Appeal Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Explain why this record is being appealed..."
                                                        className="resize-none"
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <div className="flex justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep("student")}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="min-w-32"
                                    >
                                        {createMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Record"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
