"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Download, ExternalLink, FileText, ImageIcon, Loader2 } from "lucide-react";

interface DocumentPreviewDialogProps {
    fileUrl: string;
    documentType: string;
    fileName?: string;
}

export function DocumentPreviewDialog({
    fileUrl,
    documentType,
    fileName,
}: DocumentPreviewDialogProps) {
    const [loading, setLoading] = useState(true);

    // Simple check for file type
    const isImage = fileUrl.toLocaleLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
    const isPdf = fileUrl.toLocaleLowerCase().match(/\.pdf$/i) || (!isImage && fileUrl.toLowerCase().includes('pdf'));

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/5 h-9 px-4 rounded-full border border-primary/20 transition-all font-semibold">
                    <Eye className="h-4 w-4" />
                    Visualiser
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[1.5rem]">
                <DialogHeader className="p-6 bg-primary text-primary-foreground">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
                                {isImage ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold capitalize tracking-tight">
                                    {(documentType || "Document").replace("_", " ")}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-0.5 opacity-90">
                                    <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">
                                        {isPdf ? "PDF" : isImage ? "IMAGE" : "FILE"}
                                    </span>
                                    <p className="text-sm font-medium truncate max-w-[200px] md:max-w-md">
                                        {fileName || "Document Étudiant"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 px-4 rounded-xl"
                                onClick={() => window.open(fileUrl, "_blank")}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Détails
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-10 px-4 rounded-xl font-bold shadow-lg"
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = fileUrl;
                                    link.download = fileName || "document";
                                    link.click();
                                }}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-muted/20 relative flex items-center justify-center min-h-0 overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 transition-all">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="text-sm font-bold text-muted-foreground animate-pulse">Chargement du document...</p>
                        </div>
                    )}

                    {isPdf ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0&view=FitH`}
                            className="w-full h-full border-none"
                            onLoad={() => setLoading(false)}
                        />
                    ) : isImage ? (
                        <div className="p-6 md:p-12 w-full h-full flex items-center justify-center overflow-auto custom-scrollbar">
                            <img
                                src={fileUrl}
                                alt={documentType}
                                className="max-w-full max-h-full object-contain shadow-2xl rounded-xl ring-1 ring-black/5"
                                onLoad={() => setLoading(false)}
                                onError={() => setLoading(false)}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 p-12 text-center" onPointerOver={() => setLoading(false)}>
                            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-2">
                                <FileText className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Aperçu non disponible</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">Ce type de fichier ne peut pas être visualisé directement dans le navigateur.</p>
                            </div>
                            <Button
                                onClick={() => window.open(fileUrl, "_blank")}
                                className="rounded-full px-8 h-12 shadow-lg"
                            >
                                Ouvrir dans un nouvel onglet
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
