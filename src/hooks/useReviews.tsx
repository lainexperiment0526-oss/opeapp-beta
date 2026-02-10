import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  app_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppReviews(appId: string) {
  return useQuery({
    queryKey: ['reviews', appId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_reviews')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!appId,
  });
}

export function useUserReview(appId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['review', appId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_reviews')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!appId && !!userId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ app_id, user_id, rating, review_text }: { app_id: string; user_id: string; rating: number; review_text?: string }) => {
      const { data, error } = await supabase
        .from('app_reviews')
        .upsert({ app_id, user_id, rating, review_text: review_text || null }, { onConflict: 'app_id,user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.app_id] });
      queryClient.invalidateQueries({ queryKey: ['review', vars.app_id] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      queryClient.invalidateQueries({ queryKey: ['app', vars.app_id] });
    },
  });
}
