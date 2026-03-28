import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, RefreshCw, Check, X, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SelfieCameraProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

const SelfieCamera: React.FC<SelfieCameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please ensure permissions are granted.");
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Flip horizontally for natural look (matching video)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    // Convert data URL to Blob
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        onCapture(blob);
      });
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black aspect-[3/4] shadow-2xl border-4 border-muted/20">
      {/* Video Stream / Preview */}
      {!capturedImage ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          
          {/* Professional Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* The "Face Oval" Guide */}
            <div className="w-[70%] aspect-[4/5] border-2 border-dashed border-white/50 rounded-[100%] shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"></div>
            
            <div className="mt-8 text-center px-6">
              <p className="text-white font-display font-medium text-lg drop-shadow-md">
                Align your face within the guide
              </p>
              <p className="text-white/70 font-body text-sm mt-1">
                Keep a neutral expression and good lighting
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-6 px-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onCancel}
              className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-primary bg-white/20 flex items-center justify-center group transition-transform hover:scale-105 active:scale-95"
            >
              <div className="w-16 h-16 rounded-full bg-white group-hover:bg-primary transition-colors"></div>
            </button>

            <div className="w-12"></div> {/* Spacer for symmetry */}
          </div>
        </>
      ) : (
        <>
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="bg-green-600 rounded-full p-3 mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-display">Selfie Captured</h3>
            <p className="text-sm opacity-90 mt-1">Does this photo look clear and centered?</p>
          </div>

          <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-4 px-6">
            <Button 
              onClick={handleRetake} 
              variant="outline"
              className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retake
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25"
            >
              <ShieldCheck className="w-4 h-4" /> Use Photo
            </Button>
          </div>
        </>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Initializing camera...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-lg font-bold mb-2">Camera Access Failed</p>
          <p className="text-sm text-white/70 mb-6">{error}</p>
          <Button onClick={startCamera} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Button onClick={onCancel} variant="ghost" className="mt-4 text-white/50">
            Cancel
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default SelfieCamera;
