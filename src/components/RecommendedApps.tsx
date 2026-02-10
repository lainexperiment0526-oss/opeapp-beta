import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { App, Category, Screenshot } from '@/types/app';
import { AppCard } from '@/components/AppCard';

interface RecommendedAppsProps {
  currentAppId: string;
  categoryId: string | null;
}

export function RecommendedApps({ currentAppId, categoryId }: RecommendedAppsProps) {
  const { data: apps } = useQuery({
    queryKey: ['recommended', currentAppId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('apps')
        .select('*, category:categories(*), screenshots:app_screenshots(*)')
        .neq('id', currentAppId)
        .eq('status', 'approved')
        .order('average_rating', { ascending: false })
        .limit(5);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // If same category returned fewer than 3, fetch more from other categories
      if (data.length < 3 && categoryId) {
        const { data: moreApps } = await supabase
          .from('apps')
          .select('*, category:categories(*), screenshots:app_screenshots(*)')
          .neq('id', currentAppId)
          .neq('category_id', categoryId)
          .eq('status', 'approved')
          .order('average_rating', { ascending: false })
          .limit(5 - data.length);
        return [...data, ...(moreApps || [])] as (App & { category: Category; screenshots: Screenshot[] })[];
      }
      
      return data as (App & { category: Category; screenshots: Screenshot[] })[];
    },
    enabled: !!currentAppId,
  });

  if (!apps || apps.length === 0) return null;

  return (
    <section className="mt-8 mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4">You Might Also Like</h2>
      <div className="divide-y divide-border">
        {apps.map(app => (
          <AppCard key={app.id} app={app} variant="list" />
        ))}
      </div>
    </section>
  );
}
