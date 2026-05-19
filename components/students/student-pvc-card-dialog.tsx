"use client";

import { useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Printer, FileDown, Loader2, User } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentPvcCardProps {
    student: {
        id: number;
        full_name?: string;
        enrollment_number?: string;
        image?: string | null;
        parents_info?: Array<{
            full_name?: string;
            phone?: string;
            relationship?: string;
        }>;
        enrollment_info?: { classroom?: string; academic_year?: string } | any;
        account_info?: any;
        current_class?: { class_name?: string; academic_year?: string };
    };
}

interface CardProps {
    classroom: string;
    academicYear: string;
    parentName: string;
    parentPhone: string;
    qrValue: string;
    enrollmentNumber?: string;
    fullName?: string;
    /** Always a base64 data-URL or empty string — never a path/URL */
    logoB64: string;
    /** Always a base64 data-URL or empty string — never a path/URL */
    photoB64: string;
    CARD_W: number;
    CARD_H: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHOOL_ID = "SCH-01";
// CR80 card: 85.6 × 54 mm → 856 × 540 px at 10 px/mm = perfect 1:1 for jsPDF
const CARD_W = 856;
const CARD_H = 540;
const PREVIEW_SCALE = 0.37;
const PREVIEW_W = Math.round(CARD_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(CARD_H * PREVIEW_SCALE);

// ─── Utility: URL / path → base64 data-URL ───────────────────────────────────
// Returns empty string on any failure — never throws, never lets events bubble.

async function urlToBase64(src: string): Promise<string> {
    if (!src) return "";
    if (src.startsWith("data:")) return src;

    try {
        const res = await fetch(src);
        if (!res.ok) return "";

        const blob = await res.blob();

        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string) ?? "");
            reader.onerror = () => resolve("");
            reader.readAsDataURL(blob);
        });
    } catch {
        return "";
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentPvcCardDialog({ student }: StudentPvcCardProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    // Separate refs for capture — positioned off-screen, NO CSS transform
    const captureRectoRef = useRef<HTMLDivElement>(null);
    const captureVersoRef = useRef<HTMLDivElement>(null);

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

    // ─── Print ────────────────────────────────────────────────────────────────

    const handlePrint = () => {
        const recto = captureRectoRef.current;
        const verso = captureVersoRef.current;
        if (!recto || !verso) return;

        const win = window.open("", "_blank", "width=1000,height=700");
        if (!win) return;
        win.document.write(`
      <html><head>
        <title>ID Card — ${student.full_name ?? ""}</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          body{font-family:system-ui,sans-serif;background:#fff;display:flex;flex-wrap:wrap;gap:30px;padding:20px;justify-content:center}
          @media print{body{padding:0;gap:6mm}}
        </style>
      </head><body>
        ${recto.outerHTML}
        ${verso.outerHTML}
      </body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 600);
    };

    // ─── PDF ──────────────────────────────────────────────────────────────────

    const handleDownloadPdf = async () => {
        const rectoEl = captureRectoRef.current;
        const versoEl = captureVersoRef.current;
        if (!rectoEl || !versoEl) return;

        setIsGenerating(true);
        try {
            // ① Pre-fetch logo + photo as base64 strings up front
            const [logoB64, photoB64] = await Promise.all([
                urlToBase64("/logo.png"),
                student.image ? urlToBase64(student.image) : Promise.resolve(""),
            ]);

            // ② Swap every <img> src in both capture roots to their b64 value.
            const swapImages = (root: HTMLElement) => {
                root.querySelectorAll<HTMLImageElement>("img[data-role='logo']").forEach(
                    (img) => { if (logoB64) img.src = logoB64; }
                );
                root.querySelectorAll<HTMLImageElement>("img[data-role='photo']").forEach(
                    (img) => {
                        if (photoB64) img.src = photoB64;
                        else img.style.display = "none"; // Hide if fetch failed
                    }
                );
            };
            swapImages(rectoEl);
            swapImages(versoEl);

            // ③ Capture — call toPng twice (known html-to-image warm-up quirk)
            const capture = async (el: HTMLDivElement) => {
                const opts = {
                    width: CARD_W,
                    height: CARD_H,
                    pixelRatio: 2,
                    backgroundColor: "#ffffff",
                    skipFonts: false,
                    // SAFETY FILTER: Skip any img that is NOT a data-URL (prevents crash)
                    filter: (node: Node) => {
                        if (node instanceof HTMLImageElement) {
                            const src = node.getAttribute("src") ?? "";
                            return src.startsWith("data:");
                        }
                        return true;
                    }
                };
                await toPng(el, opts).catch(() => { }); // warm-up
                return toPng(el, opts);
            };

            const [rectoUrl, versoUrl] = await Promise.all([
                capture(rectoEl),
                capture(versoEl),
            ]);

            // ④ Build PDF
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [85.6, 54],
            });
            pdf.addImage(rectoUrl, "PNG", 0, 0, 85.6, 54);
            pdf.addPage([85.6, 54], "landscape");
            pdf.addImage(versoUrl, "PNG", 0, 0, 85.6, 54);
            pdf.save(`ID-Card-${student.enrollment_number ?? student.id}.pdf`);

        } catch (err: unknown) {
            let msg = "Unknown error";
            if (err instanceof Error) msg = err.message;
            else if (typeof err === "string") msg = err;
            else {
                try { msg = JSON.stringify(err); } catch { msg = String(err); }
            }
            console.error("PDF generation error:", msg, err);
            alert(`PDF export failed:\n${msg}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // ─── Shared props for both preview and capture cards ─────────────────────
    // Preview uses real paths (browser loads them normally).
    // Capture cards use the same paths initially; they're swapped to b64 right before capture.

    const previewProps: CardProps = {
        classroom,
        academicYear,
        parentName,
        parentPhone,
        qrValue,
        enrollmentNumber: student.enrollment_number,
        fullName: student.full_name,
        logoB64: "/logo.png",           // browser loads this fine for preview
        photoB64: student.image ?? "",  // same
        CARD_W,
        CARD_H,
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold h-9"
                >
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    ID Card
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl bg-white text-zinc-900 border-none shadow-2xl p-0 overflow-hidden font-sans">

                {/* Header */}
                <div className="p-6 border-b border-zinc-100 bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black italic tracking-tighter text-zinc-900">
                            <CreditCard className="h-6 w-6 text-orange-600" />
                            ID CARD GENERATOR
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* ── Visual preview (CSS scaled, not used for capture) ── */}
                <div className="bg-[#f4f4f5]/50 p-10 flex justify-center gap-10 overflow-hidden">
                    <div style={{ width: PREVIEW_W, height: PREVIEW_H, flexShrink: 0, position: "relative" }}>
                        <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.12)", pointerEvents: "none" }}>
                            <RectoCard {...previewProps} />
                        </div>
                    </div>
                    <div style={{ width: PREVIEW_W, height: PREVIEW_H, flexShrink: 0, position: "relative" }}>
                        <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.07)", pointerEvents: "none" }}>
                            <VersoCard {...previewProps} />
                        </div>
                    </div>
                </div>

                {/* ── Hidden off-screen capture elements — no transform, no scale ── */}
                <div
                    aria-hidden="true"
                    style={{ position: "fixed", top: 0, left: "-9999px", width: CARD_W, pointerEvents: "none", zIndex: -1 }}
                >
                    <div ref={captureRectoRef} style={{ width: CARD_W, height: CARD_H, overflow: "hidden" }}>
                        <RectoCard {...previewProps} />
                    </div>
                    <div ref={captureVersoRef} style={{ width: CARD_W, height: CARD_H, overflow: "hidden" }}>
                        <VersoCard {...previewProps} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-zinc-100 bg-white">
                    <Button
                        variant="default"
                        onClick={handleDownloadPdf}
                        disabled={isGenerating}
                        className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-tighter shadow-lg shadow-orange-600/20"
                    >
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Export PVC (PDF)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="gap-2 border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold"
                    >
                        <Printer className="h-4 w-4" />
                        Print Preview
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Recto card ───────────────────────────────────────────────────────────────

function RectoCard({
    fullName,
    enrollmentNumber,
    classroom,
    academicYear,
    logoB64,
    photoB64,
    CARD_W,
    CARD_H,
}: CardProps) {
    const px = (n: number) => `${n}px`;

    return (
        <div style={{ width: CARD_W, height: CARD_H, overflow: "hidden", background: "#ffffff", color: "#000000", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif", boxSizing: "border-box", position: "relative" }}>

            {/* Watermark */}
            {logoB64 && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img data-role="logo" src={logoB64} alt="" style={{ width: px(CARD_W * 0.74), height: "auto", filter: "grayscale(1)", display: "block" }} />
                </div>
            )}

            {/* Top bar */}
            <div style={{ padding: `${CARD_H * 0.059}px ${CARD_W * 0.056}px`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 20, flexShrink: 0 }}>
                {logoB64 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img data-role="logo" src={logoB64} alt="logo" style={{ height: px(CARD_H * 0.137), width: "auto", display: "block" }} />
                )}
                <div style={{ height: px(CARD_H * 0.098), display: "flex", alignItems: "center", fontSize: px(CARD_W * 0.031), color: "#f97316", background: "rgba(249,115,22,0.1)", borderRadius: px(100), fontWeight: 900, border: "1px solid rgba(249,115,22,0.2)", padding: `0 ${CARD_W * 0.031}px` }}>
                    {academicYear}
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: `0 ${CARD_W * 0.062}px`, gap: px(CARD_W * 0.062), position: "relative", zIndex: 10, overflow: "hidden" }}>

                {/* Photo */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                        width: px(CARD_W * 0.254),
                        height: px(CARD_W * 0.254),
                        borderRadius: px(CARD_W * 0.087),
                        overflow: "hidden",
                        border: `${CARD_W * 0.009}px solid #ffffff`,
                        boxSizing: "border-box",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                        background: "#f4f4f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                    }}>
                        {/* Fallback Icon (Always rendered in background) */}
                        <User size={CARD_W * 0.124} color="#d4d4d8" style={{ position: "absolute", zIndex: 1 }} />

                        {/* Student Image (Layered on top, only if truthy) */}
                        {photoB64 && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                data-role="photo"
                                src={photoB64}
                                alt={fullName ?? ""}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    position: "relative",
                                    zIndex: 2
                                }}
                            />
                        )}
                    </div>
                    <div style={{ position: "absolute", bottom: px(-CARD_H * 0.02), left: "50%", transform: "translateX(-50%)", background: "#f97316", color: "#ffffff", height: px(CARD_H * 0.078), display: "flex", alignItems: "center", justifyContent: "center", borderRadius: px(100), fontSize: px(CARD_W * 0.022), fontWeight: 900, textTransform: "uppercase", padding: `0 ${CARD_W * 0.031}px`, boxShadow: "0 4px 10px rgba(249,115,22,0.3)", whiteSpace: "nowrap" }}>
                        Active
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                    <h2 style={{ fontSize: px(CARD_W * 0.046), fontWeight: 900, color: "#000000", letterSpacing: "-0.5px", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: `0 0 ${CARD_H * 0.015}px` }}>
                        {fullName}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: px(CARD_W * 0.015), marginBottom: px(CARD_H * 0.039) }}>
                        <span style={{ fontSize: px(CARD_W * 0.031), color: "#f97316", fontWeight: 800 }}>ID:</span>
                        <div style={{ background: "rgba(0,0,0,0.05)", padding: `1px ${CARD_W * 0.025}px`, borderRadius: px(4), fontSize: px(CARD_W * 0.031), fontWeight: 900, height: px(CARD_H * 0.088), display: "flex", alignItems: "center" }}>
                            {enrollmentNumber}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: px(CARD_H * 0.029) }}>
                        <div style={{ display: "flex", alignItems: "center", gap: px(CARD_W * 0.025) }}>
                            <div style={{ fontSize: px(CARD_W * 0.022), fontWeight: 800, textTransform: "uppercase", color: "#71717a", width: px(CARD_W * 0.124) }}>Grade</div>
                            <div style={{ fontSize: px(CARD_W * 0.028), fontWeight: 900, color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{classroom}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: px(CARD_W * 0.025) }}>
                            <div style={{ fontSize: px(CARD_W * 0.022), fontWeight: 800, textTransform: "uppercase", color: "#71717a", width: px(CARD_W * 0.124) }}>Role</div>
                            <div style={{ height: px(CARD_H * 0.088), display: "flex", alignItems: "center", fontSize: px(CARD_W * 0.028), fontWeight: 900, color: "#ffffff", background: "#000000", borderRadius: px(4), padding: `0 ${CARD_W * 0.031}px` }}>STUDENT</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accent bar */}
            <div style={{ height: px(CARD_H * 0.02), background: "#f97316", width: "100%", flexShrink: 0 }} />

            {/* Footer */}
            <div style={{ padding: `${CARD_H * 0.029}px ${CARD_W * 0.056}px`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", borderTop: "1px solid #f4f4f5", flexShrink: 0 }}>
                <span style={{ fontSize: px(CARD_W * 0.022), fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "1px" }}>Secure Campus Identity</span>
                <span style={{ fontSize: px(CARD_W * 0.022), fontWeight: 900, color: "#f97316" }}>Est. {new Date().getFullYear()}</span>
            </div>
        </div>
    );
}

// ─── Verso card ───────────────────────────────────────────────────────────────

function VersoCard({ parentName, parentPhone, qrValue, logoB64, CARD_W, CARD_H }: CardProps) {
    const px = (n: number) => `${n}px`;

    return (
        <div style={{ width: CARD_W, height: CARD_H, overflow: "hidden", background: "#ffffff", color: "#000000", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif", boxSizing: "border-box", position: "relative" }}>

            {/* Watermark */}
            {logoB64 && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img data-role="logo" src={logoB64} alt="" style={{ width: px(CARD_W * 0.74), height: "auto", filter: "grayscale(1)", display: "block" }} />
                </div>
            )}

            {/* Top bar */}
            <div style={{ padding: `${CARD_H * 0.059}px ${CARD_W * 0.056}px`, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f4f4f5", position: "relative", zIndex: 20, flexShrink: 0 }}>
                <span style={{ fontSize: px(CARD_W * 0.028), fontWeight: 900, color: "#f97316", letterSpacing: "1px" }}>IN CASE OF EMERGENCY</span>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: "flex", padding: `${CARD_H * 0.074}px ${CARD_W * 0.056}px`, gap: px(CARD_W * 0.078), position: "relative", zIndex: 10, overflow: "hidden", minHeight: 0 }}>

                {/* Left info */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: px(CARD_H * 0.049), minWidth: 0 }}>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: px(CARD_W * 0.022), fontWeight: 800, color: "#71717a", textTransform: "uppercase", margin: `0 0 ${CARD_H * 0.01}px` }}>Parent / Guardian</p>
                        <p style={{ fontSize: px(CARD_W * 0.034), fontWeight: 900, color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{parentName}</p>
                        <p style={{ fontSize: px(CARD_W * 0.031), fontWeight: 800, color: "#f97316", margin: `${CARD_H * 0.005}px 0 0` }}>{parentPhone}</p>
                    </div>
                    <div style={{ width: px(CARD_W * 0.093), height: "2px", background: "#f97316" }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: px(CARD_W * 0.025), fontWeight: 800, color: "#71717a", textTransform: "uppercase", margin: `0 0 ${CARD_H * 0.015}px` }}>Card Policy</p>
                        <p style={{ fontSize: px(CARD_W * 0.025), fontWeight: 600, color: "#52525b", lineHeight: 1.2, margin: 0 }}>
                            Card is institutional property. If found, please return to school office or call emergency lines.
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: px(CARD_W * 0.022), fontWeight: 900, color: "#000000", margin: 0 }}>
                            VALID UNTIL: <span style={{ color: "#f97316" }}>31 JUL {new Date().getFullYear() + 1}</span>
                        </p>
                    </div>
                </div>

                {/* QR panel */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: px(CARD_H * 0.039), background: "#fafafa", padding: px(CARD_W * 0.037), borderRadius: px(CARD_W * 0.043), border: "1px solid #f4f4f5", width: px(CARD_W * 0.31), flexShrink: 0 }}>
                    <div style={{ background: "white", padding: px(CARD_W * 0.012), borderRadius: px(CARD_W * 0.025), border: "1px solid #f4f4f5" }}>
                        <QRCodeCanvas value={qrValue} size={CARD_W * 0.198} level="H" fgColor="#000000" bgColor="#ffffff" />
                    </div>
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <p style={{ fontSize: px(CARD_W * 0.022), fontWeight: 900, color: "#000000", margin: 0, lineHeight: 1 }}>AUTH CODE</p>
                        <p style={{ fontSize: px(CARD_W * 0.022), color: "#f97316", fontWeight: 800, margin: 0, lineHeight: 1 }}>SRV-2026</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: `${CARD_H * 0.049}px ${CARD_W * 0.056}px`, background: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f4f4f5", position: "relative", zIndex: 20, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: px(CARD_W * 0.019) }}>
                    <div style={{ height: px(CARD_W * 0.015), width: px(CARD_W * 0.015), borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
                    <span style={{ fontSize: px(CARD_W * 0.025), fontWeight: 900, letterSpacing: "0.5px" }}>ENCRYPTED DATA</span>
                </div>
                <span style={{ fontSize: px(CARD_W * 0.022), fontWeight: 700, opacity: 0.6 }}>SCH-ID: {SCHOOL_ID}</span>
            </div>
        </div>
    );
}