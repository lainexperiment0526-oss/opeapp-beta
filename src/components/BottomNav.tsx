import { Link, useLocation } from 'react-router-dom';
import { Layers, Megaphone, BarChart3, Search, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Megaphone, label: 'Ads', path: '/advertiser' },
  { icon: Layers, label: 'Apps', path: '/submit' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Search, label: 'Search', path: '/?search=1' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-xl safe-area-inset-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={label}
              to={path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
