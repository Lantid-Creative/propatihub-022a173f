import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { validateImageResolution, MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT } from "@/lib/propertyUtils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, AlertTriangle, ImageIcon, Loader2 } from "lucide-react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  bucket: string;
  maxFiles?: number;
  minResolution?: boolean;
  label?: string;
  accept?: string;
}

const ImageUploader = ({ images, onChange, bucket, maxFiles = 10, minResolution = true, label = "Upload Images", accept = "image/*" }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const files = Array.from(e.target.files);
    if (images.length + files.length > maxFiles) {
      toast({ title: "Too many files", description: `Maximum ${maxFiles} files allowed.`, variant: "destructive" });
      return;
    }

    setUploading(true);
    setRejectedFiles([]);
    const rejected: string[] = [];
    const uploaded: string[] = [];

    for (const file of files) {
      // Validate resolution for images
      if (minResolution && file.type.startsWith("image/")) {
        const result = await validateImageResolution(file);
        if (!result.valid) {
          rejected.push(`${file.name}: ${result.message}`);
          continue;
        }
      }

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) {
        rejected.push(`${file.name}: Upload failed`);
        continue;
      }
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      uploaded.push(urlData.publicUrl);
    }

    if (rejected.length > 0) {
      setRejectedFiles(rejected);
      toast({
        title: `${rejected.length} image(s) rejected`,
        description: "Images must be at least 1200×800px",
        variant: "destructive",
      });
    }

    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]);
      toast({ title: `${uploaded.length} file(s) uploaded successfully` });
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-body font-medium text-foreground">{label}</label>
        <span className="text-[10px] text-muted-foreground font-body">{images.length}/{maxFiles}</span>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
      >
        <input ref={inputRef} type="file" multiple accept={accept} onChange={handleUpload} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm font-body text-muted-foreground">Uploading & validating...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-body text-muted-foreground">Click to upload or drag & drop</p>
            {minResolution && (
              <p className="text-[10px] text-muted-foreground font-body">
                Min resolution: {MIN_IMAGE_WIDTH}×{MIN_IMAGE_HEIGHT}px · Max {maxFiles} files
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rejected Files Warning */}
      {rejectedFiles.length > 0 && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
          <div className="flex items-center gap-2 text-destructive text-sm font-body font-medium">
            <AlertTriangle className="w-4 h-4" /> Rejected Images
          </div>
          {rejectedFiles.map((msg, i) => (
            <p key={i} className="text-xs text-destructive/80 font-body pl-6">{msg}</p>
          ))}
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-muted">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-foreground/80 text-background px-1.5 py-0.5 rounded font-body">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
