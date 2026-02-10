import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImagePreviewDialogProps {
  images: { id: string; image_url: string }[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({ images, initialIndex, open, onOpenChange }: ImagePreviewDialogProps) {
  const [index, setIndex] = useState(initialIndex);

  const prev = () => setIndex(i => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setIndex(i => (i < images.length - 1 ? i + 1 : 0));

  if (!images.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 bg-black/95 border-none">
        <button onClick={() => onOpenChange(false)} className="absolute top-3 right-3 z-10 text-white/70 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {images.length > 1 && (
            <button onClick={prev} className="absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <img
            src={images[index]?.image_url}
            alt="Preview"
            className="max-h-[80vh] max-w-full object-contain"
          />
          {images.length > 1 && (
            <button onClick={next} className="absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
        {images.length > 1 && (
          <div className="text-center text-white/60 text-sm pb-3">
            {index + 1} / {images.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
