"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, RotateCcw, Image as ImageIcon, Aperture } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentImageCaptureProps {
    value: File | null;
    onChange: (file: File | null) => void;
}

export function StudentImageCapture({ value, onChange }: StudentImageCaptureProps) {
    const [mode, setMode] = useState<"idle" | "camera" | "preview">(value ? "preview" : "idle");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const previewUrl = value ? URL.createObjectURL(value) : null;

    // Start webcam
    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            });
            setStream(mediaStream);
            setMode("camera");
            setTimeout(() => {
                if (videoRef.current) videoRef.current.srcObject = mediaStream;
            }, 50);
        } catch {
            setCameraError("Unable to access camera. Please allow camera permissions or upload an image.");
        }
    }, []);

    // Stop webcam
    const stopCamera = useCallback(() => {
        stream?.getTracks().forEach((t) => t.stop());
        setStream(null);
    }, [stream]);

    // Capture from webcam
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `student_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
                onChange(file);
                stopCamera();
                setMode("preview");
            }
        }, "image/jpeg", 0.92);
    }, [onChange, stopCamera]);

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            setMode("preview");
        }
    };

    // Reset
    const handleReset = () => {
        stopCamera();
        onChange(null);
        setMode("idle");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-3">
            <canvas ref={canvasRef} className="hidden" />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Preview */}
            {mode === "preview" && previewUrl && (
                <div className="relative w-40 h-40 mx-auto">
                    <img
                        src={previewUrl}
                        alt="Student photo"
                        className="w-full h-full rounded-full object-cover border-4 border-primary/20 shadow-md"
                    />
                    <button
                        type="button"
                        onClick={handleReset}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 shadow hover:scale-110 transition-transform"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Camera feed */}
            {mode === "camera" && (
                <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-black shadow-lg">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-h-64 object-cover"
                    />
                    {/* Viewfinder overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-[15%] border-2 border-white/40 rounded-xl" />
                    </div>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                        <Button type="button" variant="outline" size="sm" onClick={() => { stopCamera(); setMode("idle"); }}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={capturePhoto} className="bg-white text-black hover:bg-white/90">
                            <Aperture className="h-4 w-4 mr-1" /> Capture
                        </Button>
                    </div>
                </div>
            )}

            {/* Idle / Controls */}
            {mode === "idle" && (
                <div
                    className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center gap-3 bg-muted/20 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="p-3 bg-primary/10 rounded-full">
                        <ImageIcon className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Click to upload a photo, or use your webcam
                    </p>
                    <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP supported</p>
                </div>
            )}

            {cameraError && (
                <p className="text-xs text-destructive text-center">{cameraError}</p>
            )}

            {/* Action Buttons */}
            {mode !== "camera" && (
                <div className="flex gap-2 justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={startCamera}
                    >
                        <Camera className="h-4 w-4" />
                        Use Webcam
                    </Button>
                    {value && (
                        <Button type="button" variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4" />
                            Retake
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
