
-- Create app_ads table for video marketing ads
CREATE TABLE public.app_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  skip_after_seconds INTEGER NOT NULL DEFAULT 5,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_ads ENABLE ROW LEVEL SECURITY;

-- Anyone can view active ads
CREATE POLICY "Anyone can view active ads"
ON public.app_ads FOR SELECT
USING (is_active = true);

-- Users can insert ads for their own apps
CREATE POLICY "Users can insert ads for own apps"
ON public.app_ads FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = app_ads.app_id AND apps.user_id = auth.uid())
);

-- Users can update own ads
CREATE POLICY "Users can update own ads"
ON public.app_ads FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own ads
CREATE POLICY "Users can delete own ads"
ON public.app_ads FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all ads
CREATE POLICY "Admins can manage all ads"
ON public.app_ads FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_app_ads_updated_at
BEFORE UPDATE ON public.app_ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
