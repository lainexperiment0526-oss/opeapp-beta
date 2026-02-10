import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCampaignEvents(campaignId?: string) {
  return useQuery({
    queryKey: ['campaign_events', campaignId],
    queryFn: async () => {
      let query = supabase
        .from('ad_campaign_events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }
      
      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data;
    },
    enabled: true,
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics_summary'],
    queryFn: async () => {
      // Get all user's campaigns
      const { data: campaigns, error: campError } = await supabase
        .from('ad_campaigns')
        .select('id, name, ad_type, impressions_count, clicks_count, rewards_count, status');
      if (campError) throw campError;

      const totalImpressions = campaigns?.reduce((s, c) => s + (c.impressions_count || 0), 0) || 0;
      const totalClicks = campaigns?.reduce((s, c) => s + (c.clicks_count || 0), 0) || 0;
      const totalRewards = campaigns?.reduce((s, c) => s + (c.rewards_count || 0), 0) || 0;
      const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

      return {
        campaigns: campaigns || [],
        totalImpressions,
        totalClicks,
        totalRewards,
        ctr,
        activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
      };
    },
  });
}
