import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image, Film, Loader2 } from 'lucide-react';

interface MediaUploadProps {
  value: string;
  mediaType: string;
  onUpload: (url: string, detectedType: string) => void;
  onClear: () => void;
}

export function MediaUpload({ value, mediaType, onUpload, onClear }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectMediaType = (file: File): string => {
    if (file.type.startsWith('video/')) return 'video';
    return 'image'; // images and gifs
  };

  const uploadFile = async (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File too large. Max 50MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Use JPG, PNG, GIF, WebP, MP4, WebM.');
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const fileName = `ads/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('app-assets')
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('app-assets')
        .getPublicUrl(fileName);

      const detectedType = detectMediaType(file);
      onUpload(urlData.publicUrl, detectedType);
      toast.success('Media uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="space-y-2">
      <Label>Ad Media (Image, Video, or GIF)</Label>
      
      {value ? (
        <div className="relative rounded-xl border border-border overflow-hidden bg-muted">
          {mediaType === 'video' ? (
            <video src={value} className="w-full max-h-48 object-contain" controls muted />
          ) : (
            <img src={value} alt="Ad preview" className="w-full max-h-48 object-contain" />
          )}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Image className="h-6 w-6" />
                <Film className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Click or drag to upload</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP, MP4, WebM • Max 50MB</p>
              </div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" /> Choose File
              </Button>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Fallback: paste URL */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>or paste a URL:</span>
      </div>
      <Input
        value={value}
        onChange={(e) => onUpload(e.target.value, mediaType)}
        placeholder="https://example.com/ad-image.png"
        className="text-sm"
      />
    </div>
  );
}
