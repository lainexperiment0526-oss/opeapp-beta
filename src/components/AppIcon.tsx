import { cn } from '@/lib/utils';

interface AppIconProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-10 w-10',
  sm: 'h-14 w-14',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-32 w-32'
};

const textSizes = {
  xs: 'text-lg',
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl'
};

export function AppIcon({ src, name, size = 'md', className }: AppIconProps) {
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div 
      className={cn(
        'app-icon overflow-hidden bg-card flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={cn(
          'h-full w-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 font-bold text-primary-foreground',
          textSizes[size]
        )}>
          {initial}
        </div>
      )}
    </div>
  );
}
