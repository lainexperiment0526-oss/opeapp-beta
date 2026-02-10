import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { App, Category, Screenshot } from '@/types/app';
import { AppCard } from '@/components/AppCard';

interface RecommendedAppsProps {
  currentAppId: string;
  categoryId: string | null;
}

export function RecommendedApps({ currentAppId, categoryId }: RecommendedAppsProps) {
  const { data: apps, isLoading } = useQuery({
    queryKey: ['recommended', currentAppId, categoryId],
    queryFn: async () => {
      const baseQuery = () =>
        supabase
          .from('apps')
          .select('*, category:categories(*), screenshots:app_screenshots(*)')
          .neq('id', currentAppId)
          .or('status.eq.approved,status.is.null')
          .order('average_rating', { ascending: false });

      if (categoryId) {
        const { data, error } = await baseQuery().eq('category_id', categoryId).limit(5);
        if (error) throw error;
        let results = (data || []) as (App & { category: Category; screenshots: Screenshot[] })[];

        if (results.length < 3) {
          const { data: moreApps } = await baseQuery()
            .neq('category_id', categoryId)
            .limit(5 - results.length);
          results = [...results, ...(moreApps || [])] as (App & { category: Category; screenshots: Screenshot[] })[];
        }

        if (results.length === 0) {
          const { data: fallback } = await baseQuery().limit(5);
          results = (fallback || []) as (App & { category: Category; screenshots: Screenshot[] })[];
        }

        return results;
      }

      const { data, error } = await baseQuery().limit(5);
      if (error) throw error;
      return (data || []) as (App & { category: Category; screenshots: Screenshot[] })[];
    },
    enabled: !!currentAppId,
  });

  return (
    <section className="mt-8 mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4">You Might Also Like</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-28 rounded bg-muted animate-pulse mb-2" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : apps && apps.length > 0 ? (
        <div className="divide-y divide-border">
          {apps.map(app => (
            <AppCard key={app.id} app={app} variant="list" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recommendations yet.</p>
      )}
    </section>
  );
}
