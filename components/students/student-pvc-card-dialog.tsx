"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Printer, FileDown, Loader2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface StudentPvcCardProps {
    student: {
        id: number;
        full_name?: string;
        enrollment_number?: string;
        image?: string | null;
        parents_info?: Array<{ full_name?: string; phone?: string; relationship?: string }>;
        enrollment_info?: { classroom?: string; academic_year?: string } | any;
        account_info?: any;
    };
}

const SCHOOL_NAME = "EduCore School";
const SCHOOL_ID = "SCH-01";

export function StudentPvcCardDialog({ student }: StudentPvcCardProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);
    const rectoRef = useRef<HTMLDivElement>(null);
    const versoRef = useRef<HTMLDivElement>(null);

    const classroom =
        student.current_class?.class_name ||
        (typeof student.enrollment_info === "object" && student.enrollment_info?.classroom) ||
        "—";
    const academicYear =
        student.current_class?.academic_year ||
        (typeof student.enrollment_info === "object" && student.enrollment_info?.academic_year) ||
        "—";

    const primaryParent = student.parents_info?.[0];
    const parentPhone = primaryParent?.phone || "—";
    const parentName = primaryParent?.full_name || "—";

    const qrValue = student.enrollment_number || student.id.toString();

    const initials = (student.full_name || "?")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) return;

        // Use clean, embedded styles for the print window
        printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card — ${student.full_name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { font-family: 'Segoe UI', sans-serif; background: white; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 30px; }
            .card { width: 85.6mm; height: 54mm; overflow: hidden; position: relative; display: flex; flex-direction: column; page-break-inside: avoid; }
            .recto { background: #ffffff; color: #000000; }
            .verso { background: #ffffff; color: #000000; }
            .card-header { padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; background: #ffffff; border-bottom: 2px solid #000000; }
            .card-body { flex: 1; display: flex; align-items: center; padding: 12px; gap: 14px; }
            .avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #000000; }
            .avatar-placeholder { width: 64px; height: 64px; border-radius: 50%; background: #ffffff; border: 2px solid #000000; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #000000; }
            .logo { height: 28px; width: auto; object-fit: contain; }
            .footer { background: #000000; padding: 5px; font-size: 7px; text-align: center; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const handleDownloadPdf = async () => {
        if (!rectoRef.current || !versoRef.current) return;
        setIsGenerating(true);

        try {
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [85.6, 54],
            });

            // CLEAN CAPTURE STRATEGY
            const captureOptions: any = {
                scale: 4,
                useCORS: true,
                logging: false,
                backgroundColor: null,
                onclone: (clonedDoc: Document) => {
                    // Remove ALL existing styles to prevent any oklch parsing errors
                    const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
                    styles.forEach(s => s.remove());

                    // Manually force color-scheme and inject ONLY base hex styles
                    const style = clonedDoc.createElement("style");
                    style.innerHTML = `
                        .card { width: 323px !important; height: 204px !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; position: relative !important; font-family: sans-serif !important; }
                        .recto { background: #ffffff !important; color: #000000 !important; }
                        .verso { background: #ffffff !important; color: #000000 !important; }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            };

            // Capture Recto
            const rectoCanvas = await html2canvas(rectoRef.current as HTMLElement, captureOptions);
            const rectoImgData = rectoCanvas.toDataURL("image/png");
            pdf.addImage(rectoImgData, "PNG", 0, 0, 85.6, 54, "recto", "FAST");

            // Add Verso page
            pdf.addPage([85.6, 54], "landscape");

            // Capture Verso
            const versoCanvas = await html2canvas(versoRef.current as HTMLElement, captureOptions);
            const versoImgData = versoCanvas.toDataURL("image/png");
            pdf.addImage(versoImgData, "PNG", 0, 0, 85.6, 54, "verso", "FAST");

            pdf.save(`Student_Card_${student.enrollment_number}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                    <CreditCard className="h-4 w-4" />
                    Print ID Card
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white text-slate-900 border-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-zinc-900" />
                        Student PVC Card — {student.full_name}
                    </DialogTitle>
                </DialogHeader>

                <div ref={printRef} className="flex flex-wrap gap-6 justify-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    {/* ===== RECTO ===== */}
                    <div
                        ref={rectoRef}
                        className="card recto shadow-xl"
                        style={{ width: "323px", height: "204px", overflow: "hidden", background: "#ffffff", color: "#000000", display: "flex", flexDirection: "column" }}
                    >
                        <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", borderBottom: "2px solid #000000" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <img src="/logo.png" alt="logo" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
                                <div style={{ fontSize: "8px", color: "#000000", marginLeft: "10px", fontWeight: "700", borderLeft: "2px solid #000000", paddingLeft: "10px" }}>Student ID Card</div>
                            </div>
                            <span style={{ fontSize: "8px", background: "#000000", color: "#ffffff", padding: "3px 8px", borderRadius: "4px", fontWeight: "800" }}>{academicYear}</span>
                        </div>

                        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "16px", gap: "16px" }}>
                            {student.image ? (
                                <img src={student.image} alt={student.full_name} className="avatar" style={{ width: "68px", height: "68px", borderRadius: "50%", objectFit: "cover", border: "2px solid #000000" }} />
                            ) : (
                                <div className="avatar-placeholder" style={{ width: "68px", height: "68px", borderRadius: "50%", background: "#ffffff", border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, color: "#000000" }}>
                                    {initials}
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: "16px", fontWeight: 900, lineHeight: 1.2, color: "#000000" }}>{student.full_name}</div>
                                <div style={{ fontSize: "11px", fontFamily: "monospace", marginTop: "4px", color: "#000000", fontWeight: "700" }}>ID: {student.enrollment_number}</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "12px" }}>
                                    <div style={{ fontSize: "9px", border: "1.5px solid #000000", padding: "3px 12px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#000000", width: "fit-content" }}>
                                        CLASS : {classroom}
                                    </div>
                                    <div style={{ fontSize: "9px", border: "1.5px solid #000000", padding: "3px 12px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#000000", width: "fit-content" }}>
                                        YEAR : {academicYear}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: "#000000", padding: "6px 14px", fontSize: "7px", textAlign: "center", color: "#ffffff", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: "700" }}>
                            Official Institution Document
                        </div>
                    </div>

                    {/* ===== VERSO ===== */}
                    <div
                        ref={versoRef}
                        className="card verso shadow-md"
                        style={{ width: "323px", height: "204px", overflow: "hidden", background: "#ffffff", color: "#000000", display: "flex", flexDirection: "column" }}
                    >
                        <div style={{ background: "#000000", color: "#ffffff", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.5px", color: "#ffffff" }}>EMERGENCY SERVICES</div>
                        </div>

                        <div style={{ flex: 1, display: "flex", padding: "16px", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: "10px" }}>
                                    <div style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase", color: "#000000", marginBottom: "2px" }}>Parent / Guardian</div>
                                    <div style={{ fontSize: "13px", color: "#000000", fontWeight: 800 }}>{parentName}</div>
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <div style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase", color: "#000000", marginBottom: "2px" }}>Phone Number</div>
                                    <div style={{ fontSize: "13px", color: "#000000", fontWeight: 800 }}>{parentPhone}</div>
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <div style={{ fontSize: "8px", fontWeight: 800, textTransform: "uppercase", color: "#000000", marginBottom: "2px" }}>Blood Group</div>
                                    <div style={{ fontSize: "13px", color: "#000000", fontWeight: 800 }}>—</div>
                                </div>
                                <div style={{ fontSize: "7.5px", color: "#000000", fontStyle: "italic", paddingTop: "8px", borderTop: "2px dashed #000000" }}>
                                    This card is mandatory for accessing school services.
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                <QRCodeCanvas value={qrValue} size={80} level="M" fgColor="#000000" bgColor="#ffffff" />
                                <div style={{ fontSize: "7px", color: "#000000", fontWeight: 800 }}>VERIF-ID</div>
                            </div>
                        </div>

                        <div style={{ background: "#000000", padding: "6px 14px", fontSize: "8px", textAlign: "center", color: "#ffffff", fontWeight: "800" }}>
                            {SCHOOL_NAME} · {SCHOOL_ID}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="default"
                        onClick={handleDownloadPdf}
                        disabled={isGenerating}
                        className="gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileDown className="h-4 w-4" />
                        )}
                        Télécharger PDF (PVC)
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold">
                        <Printer className="h-4 w-4" />
                        Print on Paper
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
