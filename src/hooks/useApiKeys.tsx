import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiKey {
  id: string;
  user_id: string;
  app_name: string;
  api_key: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export function useUserApiKeys() {
  return useQuery({
    queryKey: ['api_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ApiKey[];
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { user_id: string; app_name: string }) => {
      const { data, error } = await supabase
        .from('app_api_keys')
        .insert(params)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('app_api_keys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });
}
