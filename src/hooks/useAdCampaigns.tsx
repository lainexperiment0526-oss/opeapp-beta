import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdCampaign {
  id: string;
  user_id: string;
  app_id: string | null;
  name: string;
  ad_type: 'banner' | 'interstitial' | 'rewarded';
  media_url: string;
  media_type: 'image' | 'video';
  destination_url: string;
  title: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'paused' | 'active';
  daily_budget: number;
  total_budget: number;
  impressions_count: number;
  clicks_count: number;
  rewards_count: number;
  skip_after_seconds: number;
  reward_amount: number;
  created_at: string;
  updated_at: string;
}

export function useUserCampaigns() {
  return useQuery({
    queryKey: ['ad_campaigns', 'user'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AdCampaign[];
    },
  });
}

export function useAllCampaigns() {
  return useQuery({
    queryKey: ['ad_campaigns', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AdCampaign[];
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: {
      user_id: string;
      app_id?: string;
      name: string;
      ad_type: string;
      media_url: string;
      media_type?: string;
      destination_url: string;
      title?: string;
      description?: string;
      daily_budget?: number;
      total_budget?: number;
      skip_after_seconds?: number;
      reward_amount?: number;
    }) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaign)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await supabase
        .from('ad_campaigns')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_campaigns'] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ad_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_campaigns'] });
    },
  });
}
