import { useTheme } from '@/hooks/useTheme';
import openappLight from '@/assets/openapp-light.png';
import openappDark from '@/assets/openapp-dark.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
};

export function Logo({ size = 'md', className }: LogoProps) {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? openappDark : openappLight;
  
  return (
    <img 
      src={logoSrc} 
      alt="OpenApp Logo" 
      className={cn(sizeClasses[size], 'object-contain', className)}
    />
  );
}
