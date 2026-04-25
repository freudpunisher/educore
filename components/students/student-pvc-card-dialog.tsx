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
        typeof student.enrollment_info === "object" && student.enrollment_info
            ? student.enrollment_info.classroom || "—"
            : "—";
    const academicYear =
        typeof student.enrollment_info === "object" && student.enrollment_info
            ? student.enrollment_info.academic_year || "—"
            : "—";

    const primaryParent = student.parents_info?.[0];
    const parentPhone = primaryParent?.phone || "—";
    const parentName = primaryParent?.full_name || "—";

    const qrValue = JSON.stringify({
        id: `STU-${student.enrollment_number}`,
        type: "student",
        school: SCHOOL_ID,
    });

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
          <title>Carte Scolaire — ${student.full_name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { font-family: 'Segoe UI', sans-serif; background: white; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 30px; }
            .card { width: 85.6mm; height: 54mm; border-radius: 10px; overflow: hidden; position: relative; display: flex; flex-direction: column; page-break-inside: avoid; }
            .recto { background: #1a237e; color: white; }
            .verso { background: #f5f5f5; color: #1a237e; border: 1px solid #eee; }
            .card-header { padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); }
            .card-body { flex: 1; display: flex; align-items: center; padding: 12px; gap: 14px; }
            .avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.4); }
            .avatar-placeholder { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
            .footer { background: rgba(0,0,0,0.2); padding: 5px; font-size: 8px; text-align: center; }
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
                        * { color-scheme: light !important; box-sizing: border-box !important; }
                        .card { width: 323px !important; height: 204px !important; border-radius: 10px !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; position: relative !important; font-family: sans-serif !important; }
                        .recto { background: #1a237e !important; color: #ffffff !important; }
                        .verso { background: #fdfdfd !important; color: #1a237e !important; border: 1px solid #dddddd !important; }
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

            pdf.save(`Carte_Scolaire_${student.enrollment_number}.pdf`);
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
                    Imprimer Carte
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white text-slate-900 border-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-700" />
                        Carte PVC Élève — {student.full_name}
                    </DialogTitle>
                </DialogHeader>

                <div ref={printRef} className="flex flex-wrap gap-6 justify-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    {/* ===== RECTO ===== */}
                    <div
                        ref={rectoRef}
                        className="card recto shadow-xl"
                        style={{ width: "323px", height: "204px", borderRadius: "10px", overflow: "hidden", background: "#1a237e", color: "#ffffff", display: "flex", flexDirection: "column" }}
                    >
                        <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.15)" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: "#ffffff" }}>{SCHOOL_NAME}</div>
                                <div style={{ fontSize: "8px", opacity: 0.8, color: "#ffffff" }}>Carte Scolaire</div>
                            </div>
                            <span style={{ fontSize: "8px", background: "rgba(255,255,255,0.2)", color: "#ffffff", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>{academicYear}</span>
                        </div>

                        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "16px", gap: "16px" }}>
                            {student.image ? (
                                <img src={student.image} alt={student.full_name} className="avatar" style={{ width: "68px", height: "68px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }} />
                            ) : (
                                <div className="avatar-placeholder" style={{ width: "68px", height: "68px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, color: "#ffffff" }}>
                                    {initials}
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.2, color: "#ffffff" }}>{student.full_name}</div>
                                <div style={{ fontSize: "11px", opacity: 0.8, fontFamily: "monospace", marginTop: "4px", color: "#ffffff" }}>ID: {student.enrollment_number}</div>
                                <div style={{ fontSize: "10px", marginTop: "12px", background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "4px", display: "inline-block", fontWeight: "700", color: "#ffffff" }}>
                                    CLASSE : {classroom}
                                </div>
                            </div>
                        </div>

                        <div style={{ background: "rgba(0,0,0,0.15)", padding: "6px 14px", fontSize: "8px", textAlign: "center", fontStyle: "italic", color: "#ffffff" }}>
                            Document officiel de l'établissement
                        </div>
                    </div>

                    {/* ===== VERSO ===== */}
                    <div
                        ref={versoRef}
                        className="card verso shadow-md"
                        style={{ width: "323px", height: "204px", borderRadius: "10px", overflow: "hidden", background: "#fcfcfc", color: "#1a237e", display: "flex", flexDirection: "column", border: "1px solid #e5e7eb" }}
                    >
                        <div style={{ background: "#161d6f", color: "#ffffff", padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px", color: "#ffffff" }}>SERVICES D'URGENCE</div>
                        </div>

                        <div style={{ flex: 1, display: "flex", padding: "16px", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: "10px" }}>
                                    <div style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", color: "#3949ab", marginBottom: "2px" }}>Parent / Tuteur</div>
                                    <div style={{ fontSize: "13px", color: "#111827", fontWeight: 700 }}>{parentName}</div>
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <div style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", color: "#3949ab", marginBottom: "2px" }}>Téléphone</div>
                                    <div style={{ fontSize: "13px", color: "#111827", fontWeight: 700 }}>{parentPhone}</div>
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <div style={{ fontSize: "8px", fontWeight: 700, textTransform: "uppercase", color: "#3949ab", marginBottom: "2px" }}>Groupe Sanguin</div>
                                    <div style={{ fontSize: "13px", color: "#111827", fontWeight: 700 }}>—</div>
                                </div>
                                <div style={{ fontSize: "7.5px", color: "#6b7280", fontStyle: "italic", paddingTop: "8px", borderTop: "1px dashed #d1d5db" }}>
                                    Cette carte est obligatoire pour accéder aux services de l'école.
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                <QRCodeCanvas value={qrValue} size={80} level="M" fgColor="#161d6f" bgColor="#fcfcfc" />
                                <div style={{ fontSize: "7px", color: "#6b7280", fontWeight: 700 }}>VERIF-ID</div>
                            </div>
                        </div>

                        <div style={{ background: "#f3f4f6", padding: "6px 14px", fontSize: "8px", textAlign: "center", color: "#374151", fontWeight: "700" }}>
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
                        Imprimer Papier
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
