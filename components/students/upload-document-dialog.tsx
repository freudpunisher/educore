"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, FileText, Upload, Shield, ShieldOff } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { uploadDocumentSchema, UploadDocumentData } from "@/lib/schemas/student.Schema";
import { useUploadStudentDocument } from "@/hooks/use-students";

interface UploadStudentDocumentDialogProps {
    studentId: number;
}

export function UploadStudentDocumentDialog({ studentId }: UploadStudentDocumentDialogProps) {
    const [open, setOpen] = useState(false);
    const { mutate: uploadDocument, isPending } = useUploadStudentDocument(studentId);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<UploadDocumentData>({
        resolver: zodResolver(uploadDocumentSchema),
        defaultValues: {
            description: "",
            is_public: true,
        },
    });

    const isPublic = watch("is_public");

    const onSubmit = (data: UploadDocumentData) => {
        const formData = new FormData();
        formData.append("document_type", data.document_type);
        if (data.description) formData.append("description", data.description);
        formData.append("is_public", String(data.is_public));

        // The file field in Zod is 'any' but we expect a FileList or File
        if (data.file instanceof FileList && data.file.length > 0) {
            formData.append("file", data.file[0]);
        } else if (data.file instanceof File) {
            formData.append("file", data.file);
        }

        uploadDocument(formData, {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Attach a new document to this student's profile.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="document_type">Document Type *</Label>
                            <Select onValueChange={(val) => setValue("document_type", val as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bulletin">Bulletin (Report Card)</SelectItem>
                                    <SelectItem value="certificate">Certificate</SelectItem>
                                    <SelectItem value="enrollment">Enrollment Documents</SelectItem>
                                    <SelectItem value="exam_copy">Exam Copy</SelectItem>
                                    <SelectItem value="medical">Medical Document</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.document_type && (
                                <p className="text-sm text-destructive">{errors.document_type.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">File *</Label>
                            <Input
                                id="file"
                                type="file"
                                className="cursor-pointer"
                                accept=".pdf,image/*"
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) setValue("file", files);
                                }}
                            />
                            {errors.file && (
                                <p className="text-sm text-destructive">{String(errors.file.message)}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                placeholder="E.g. Term 1 Grades"
                                {...register("description")}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2">
                                    {isPublic ? <Shield className="h-4 w-4 text-primary" /> : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
                                    Public Visibility
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Visible to student and parents in their dashboard.
                                </p>
                            </div>
                            <Switch
                                checked={isPublic}
                                onCheckedChange={(val) => setValue("is_public", val)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => {
                            setOpen(false)
                            reset()
                        }}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
