"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Printer, FileDown, Loader2, User } from "lucide-react";
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
        current_class?: { class_name?: string; academic_year?: string };
    };
}

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

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) return;

        printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card — ${student.full_name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { font-family: Arial, sans-serif; background: white; display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 30px; }
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

            const captureOptions: any = {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: 323,
                height: 204,
                windowWidth: 323,
                windowHeight: 204,
                onclone: (clonedDoc: Document) => {
                    // HARD ISOLATION + TOTAL RESET
                    const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
                    styles.forEach(s => s.remove());

                    const style = clonedDoc.createElement("style");
                    style.innerHTML = `
                        * { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            box-sizing: border-box !important; 
                            -webkit-print-color-adjust: exact !important;
                        }
                        body { 
                            font-family: system-ui, -apple-system, sans-serif !important; 
                            background: white !important;
                        }
                        .card {
                            width: 323px !important;
                            height: 204px !important;
                            position: absolute !important;
                            top: 0 !important;
                            left: 0 !important;
                            overflow: hidden !important;
                            background: white !important;
                        }
                        img { display: block !important; max-width: none !important; }
                    `;
                    clonedDoc.head.appendChild(style);

                    const card = clonedDoc.querySelector('.card');
                    if (card) card.classList.add('capture-ready');
                }
            };

            // Capture Recto
            const rectoCanvas = await html2canvas(rectoRef.current, captureOptions);
            const rectoImgData = rectoCanvas.toDataURL("image/png", 1.0);
            pdf.addImage(rectoImgData, "PNG", 0, 0, 85.6, 54, "recto", "SLOW");

            // Add Verso page
            pdf.addPage([85.6, 54], "landscape");

            // Capture Verso
            const versoCanvas = await html2canvas(versoRef.current, captureOptions);
            const versoImgData = versoCanvas.toDataURL("image/png", 1.0);
            pdf.addImage(versoImgData, "PNG", 0, 0, 85.6, 54, "verso", "SLOW");

            pdf.save(`ID-Card-${student.enrollment_number || student.id}.pdf`);
        } catch (error) {
            console.error("Critical PDF Generation Error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold h-9">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    ID Card
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white text-zinc-900 border-none shadow-2xl p-0 overflow-hidden font-sans">
                <div className="p-6 border-b border-zinc-100 bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black italic tracking-tighter text-zinc-900">
                            <CreditCard className="h-6 w-6 text-orange-600" />
                            ID CARD GENERATOR
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="bg-[#f4f4f5]/50 p-12 flex justify-center">
                    <div ref={printRef} style={{ display: "flex", flexWrap: "wrap", gap: "48px", justifyContent: "center", width: "100%" }}>
                        {/* ===== RECTO ===== */}
                        <div
                            ref={rectoRef}
                            className="card"
                            style={{
                                width: "323px",
                                height: "204px",
                                overflow: "hidden",
                                background: "#ffffff",
                                color: "#000000",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "16px",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                                border: "none",
                                boxSizing: "border-box",
                                position: "relative",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.1)"
                            }}
                        >
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.04 }}>
                                <img src="/logo.png" alt="" style={{ width: "240px", height: "auto", filter: "grayscale(1)" }} />
                            </div>

                            <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <img src="/logo.png" alt="logo" style={{ height: "28px", width: "auto" }} />
                                </div>
                                <div style={{ height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#f97316", background: "rgba(249, 115, 22, 0.1)", borderRadius: "100px", fontWeight: "900", border: "1px solid rgba(249, 115, 22, 0.2)", padding: "0 10px" }}>
                                    {academicYear}
                                </div>
                            </div>

                            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 20px", gap: "20px", position: "relative", zIndex: 10 }}>
                                <div style={{ position: "relative", flexShrink: 0 }}>
                                    <div style={{
                                        width: "82px",
                                        height: "82px",
                                        borderRadius: "28px",
                                        overflow: "hidden",
                                        border: "3px solid #ffffff",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                                        background: "#f4f4f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        {student.image ? (
                                            <img src={student.image} alt={student.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <User size={40} color="#d4d4d8" />
                                        )}
                                    </div>
                                    <div style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", background: "#f97316", color: "#ffffff", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "100px", fontSize: "7px", fontWeight: "900", textTransform: "uppercase", padding: "0 10px", boxShadow: "0 4px 10px rgba(249, 115, 22, 0.3)" }}>
                                        Active
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                                    <h2 style={{ fontSize: "15px", fontWeight: "900", color: "#000000", marginBottom: "3px", letterSpacing: "-0.5px", lineHeight: "1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                                        {student.full_name}
                                    </h2>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "10px", color: "#f97316", fontWeight: "800" }}>ID:</span>
                                        <div style={{ background: "rgba(0,0,0,0.05)", padding: "1px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "900", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {student.enrollment_number}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ fontSize: "7px", fontWeight: "800", textTransform: "uppercase", color: "#71717a", width: "40px" }}>Grade</div>
                                            <div style={{ fontSize: "9px", fontWeight: "900", color: "#000000", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{classroom}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ fontSize: "7px", fontWeight: "800", textTransform: "uppercase", color: "#71717a", width: "40px" }}>Role</div>
                                            <div style={{ height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "900", color: "#ffffff", background: "#000000", borderRadius: "4px", padding: "0 10px" }}>STUDENT</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ position: "absolute", bottom: "20px", right: "0px", width: "45px", height: "45px", opacity: 0.12 }}>
                                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "2px solid #ea580c", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-15deg)" }}>
                                        <div style={{ fontSize: "6px", fontWeight: "900", color: "#ea580c", textAlign: "center", textTransform: "uppercase", lineHeight: "1.1" }}>Official<br />Valid</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: "4px", background: "#f97316", width: "100%" }}></div>
                            <div style={{ padding: "6px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", borderTop: "1px solid #f4f4f5" }}>
                                <span style={{ fontSize: "7px", fontWeight: "800", color: "#71717a", textTransform: "uppercase", letterSpacing: "1px" }}>Secure Campus Identity</span>
                                <span style={{ fontSize: "7px", fontWeight: "900", color: "#f97316" }}>Est. {new Date().getFullYear()}</span>
                            </div>
                        </div>

                        {/* ===== VERSO ===== */}
                        <div
                            ref={versoRef}
                            className="card"
                            style={{
                                width: "323px",
                                height: "204px",
                                overflow: "hidden",
                                background: "#ffffff",
                                color: "#000000",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "16px",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                                border: "none",
                                boxSizing: "border-box",
                                position: "relative",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                            }}
                        >
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.04 }}>
                                <img src="/logo.png" alt="" style={{ width: "240px", height: "auto", filter: "grayscale(1)" }} />
                            </div>

                            <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f4f4f5", position: "relative", zIndex: 20 }}>
                                <span style={{ fontSize: "9px", fontWeight: "900", color: "#f97316", letterSpacing: "1px" }}>IN CASE OF EMERGENCY</span>
                            </div>

                            <div style={{ flex: 1, display: "flex", padding: "15px 18px", gap: "25px", position: "relative", zIndex: 10, minHeight: 0 }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: "7px", fontWeight: "800", color: "#71717a", textTransform: "uppercase", margin: 0, marginBottom: "2px" }}>Parent / Guardian</p>
                                        <p style={{ fontSize: "11px", fontWeight: "900", color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{parentName}</p>
                                        <p style={{ fontSize: "10px", fontWeight: "800", color: "#f97316", margin: 0, marginTop: "1px" }}>{parentPhone}</p>
                                    </div>
                                    <div style={{ width: "30px", height: "1.5px", background: "#f97316", margin: 0 }}></div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p style={{ fontSize: "8px", fontWeight: "800", color: "#71717a", textTransform: "uppercase", margin: 0, marginBottom: "3px" }}>Card Policy</p>
                                        <p style={{ fontSize: "8px", fontWeight: "600", color: "#52525b", lineHeight: "1.2", margin: 0 }}>
                                            Card is institutional property. If found, please return to school office or call emergency lines.
                                        </p>
                                    </div>
                                    <div style={{ marginTop: "auto" }}>
                                        <p style={{ fontSize: "7px", fontWeight: "900", color: "#000000", margin: 0 }}>VALID UNTIL: <span style={{ color: "#f97316" }}>31 JUL {new Date().getFullYear() + 1}</span></p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: "#fafafa", padding: "12px", borderRadius: "14px", border: "1px solid #f4f4f5", width: "100px" }}>
                                    <div style={{ background: "white", padding: "4px", borderRadius: "8px", border: "1px solid #f4f4f5", margin: 0 }}>
                                        <QRCodeCanvas value={qrValue} size={64} level="H" fgColor="#000000" bgColor="#ffffff" />
                                    </div>
                                    <div style={{ textAlign: "center", width: "100%", display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <p style={{ fontSize: "7px", fontWeight: "900", color: "#000000", margin: 0, lineHeight: 1 }}>AUTH CODE</p>
                                        <p style={{ fontSize: "7px", color: "#f97316", fontWeight: "800", margin: 0, lineHeight: 1 }}>SRV-2026</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px 18px", background: "#ffffff", color: "#000000", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f4f4f5", position: "relative", zIndex: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ height: "5px", width: "5px", borderRadius: "50%", background: "#f97316" }}></div>
                                    <span style={{ fontSize: "8px", fontWeight: "900", letterSpacing: "0.5px" }}>ENCRYPTED DATA</span>
                                </div>
                                <span style={{ fontSize: "7px", fontWeight: "700", opacity: 0.6 }}>SCH-ID: {SCHOOL_ID}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-zinc-100 bg-white">
                    <Button
                        variant="default"
                        onClick={handleDownloadPdf}
                        disabled={isGenerating}
                        className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-tighter shadow-lg shadow-orange-600/20"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileDown className="h-4 w-4" />
                        )}
                        Export PVC (PDF)
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-2 border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold">
                        <Printer className="h-4 w-4" />
                        Print Preview
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
