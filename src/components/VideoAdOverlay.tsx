import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AppIcon } from './AppIcon';
import { App, Category } from '@/types/app';
import { Link } from 'react-router-dom';

interface AdData {
  id: string;
  video_url: string;
  title: string | null;
  description: string | null;
  skip_after_seconds: number;
  duration_seconds: number | null;
  app: App & { category?: Category };
}

interface VideoAdOverlayProps {
  ad: AdData;
  onClose: () => void;
}

export function VideoAdOverlay({ ad, onClose }: VideoAdOverlayProps) {
  const [countdown, setCountdown] = useState(ad.skip_after_seconds || 5);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (countdown <= 0) {
      setCanSkip(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Video */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          src={ad.video_url}
          autoPlay
          playsInline
          muted={false}
          loop
          className="h-full w-full object-contain"
          onEnded={onClose}
        />

        {/* Skip / Countdown button */}
        <div className="absolute top-4 right-4">
          {canSkip ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-4 py-2 text-white text-sm font-medium hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
              Skip Ad
            </button>
          ) : (
            <div className="rounded-full bg-black/60 backdrop-blur px-4 py-2 text-white text-sm font-medium">
              Skip in {countdown}s
            </div>
          )}
        </div>

        {/* Ad label */}
        <div className="absolute top-4 left-4">
          <span className="rounded bg-yellow-500/90 px-2 py-0.5 text-xs font-bold text-black uppercase">
            Ad
          </span>
        </div>
      </div>

      {/* App info bar at bottom - like App Store */}
      <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center gap-3 safe-area-inset-bottom">
        <Link to={`/app/${ad.app.id}`} onClick={onClose} className="flex-shrink-0">
          <AppIcon src={ad.app.logo_url} name={ad.app.name} size="sm" />
        </Link>
        <Link to={`/app/${ad.app.id}`} onClick={onClose} className="flex-1 min-w-0">
          <p className="text-xs text-white/60">App Store</p>
          <h4 className="text-white font-medium text-sm truncate">{ad.app.name}</h4>
          <p className="text-xs text-white/60 truncate">{ad.app.category?.name || 'App'}</p>
        </Link>
        <a
          href={ad.app.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 rounded-full bg-blue-500 px-5 py-1.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
        >
          Get
        </a>
        {ad.app.has_in_app_purchases && (
          <span className="text-[10px] text-white/40 absolute bottom-1 right-4">In-App Purchases</span>
        )}
      </div>
    </div>
  );
}
