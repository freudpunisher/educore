"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useStudentDetail } from "@/hooks/use-students";
import { Loader2, User } from "lucide-react";
import { StudentDetailView } from "./student-detail-view";

interface StudentDetailDialogProps {
    studentId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StudentDetailDialog({
    studentId,
    open,
    onOpenChange,
}: StudentDetailDialogProps) {
    const { data: student, isLoading } = useStudentDetail(studentId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-background">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-2xl flex items-center gap-3">
                        <User className="h-6 w-6 text-primary" />
                        Student Profile
                    </DialogTitle>
                    <DialogDescription>
                        Full details and records for {student?.full_name || "the selected student"}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse font-medium">Loading profile...</p>
                        </div>
                    ) : student ? (
                        <StudentDetailView student={student} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <p className="text-destructive font-medium">Failed to load student profile.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
