
-- Ad Campaigns table - core of the ad network
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'interstitial', 'rewarded')),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  destination_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paused', 'active')),
  daily_budget NUMERIC DEFAULT 0,
  total_budget NUMERIC DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  rewards_count INTEGER DEFAULT 0,
  skip_after_seconds INTEGER DEFAULT 5,
  reward_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns" ON public.ad_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create campaigns" ON public.ad_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns" ON public.ad_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns" ON public.ad_campaigns FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all campaigns" ON public.ad_campaigns FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all campaigns" ON public.ad_campaigns FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- API Keys table for per-app authentication
CREATE TABLE public.app_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  api_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.app_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own api keys" ON public.app_api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create api keys" ON public.app_api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own api keys" ON public.app_api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own api keys" ON public.app_api_keys FOR DELETE USING (auth.uid() = user_id);

-- Ad Event Tracking table (for impressions, clicks, rewards)
CREATE TABLE public.ad_campaign_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.app_api_keys(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'reward_complete')),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ad_campaign_events ENABLE ROW LEVEL SECURITY;

-- Users can view events for their own campaigns
CREATE POLICY "Users can view their campaign events" ON public.ad_campaign_events FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ad_campaigns WHERE id = campaign_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all events" ON public.ad_campaign_events FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));
-- Allow inserts from edge functions (service role) - no user auth needed for tracking
CREATE POLICY "Allow anonymous event inserts" ON public.ad_campaign_events FOR INSERT WITH CHECK (true);

-- Allow anonymous reads of active campaigns for ad serving
CREATE POLICY "Anyone can view approved active campaigns" ON public.ad_campaigns FOR SELECT USING (status = 'active');

-- Trigger for updated_at
CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for fast ad serving queries
CREATE INDEX idx_ad_campaigns_type_status ON public.ad_campaigns(ad_type, status);
CREATE INDEX idx_ad_campaign_events_campaign ON public.ad_campaign_events(campaign_id, event_type);
CREATE INDEX idx_app_api_keys_key ON public.app_api_keys(api_key) WHERE is_active = true;
