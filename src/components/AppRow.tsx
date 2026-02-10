import { App, Category, Screenshot } from '@/types/app';
import { AppCard } from './AppCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppRowProps {
  title: string;
  apps: (App & { category?: Category; screenshots?: Screenshot[] })[];
  showAll?: string;
  variant?: 'default' | 'compact';
}

export function AppRow({ title, apps, showAll, variant = 'default' }: AppRowProps) {
  if (apps.length === 0) return null;

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {showAll && (
          <Link
            to={showAll}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            See All <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      {variant === 'compact' ? (
        <div className="space-y-1 rounded-2xl bg-card p-2 shadow-sm">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {apps.map((app) => (
            <div key={app.id} className="w-40 flex-shrink-0">
              <AppCard app={app} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
