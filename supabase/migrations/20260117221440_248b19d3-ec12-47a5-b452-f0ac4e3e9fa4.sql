-- Add new fields to apps table for App Store features
ALTER TABLE public.apps
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS developer_name text,
ADD COLUMN IF NOT EXISTS age_rating text DEFAULT '4+',
ADD COLUMN IF NOT EXISTS ratings_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS downloads_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS whats_new text,
ADD COLUMN IF NOT EXISTS privacy_policy_url text,
ADD COLUMN IF NOT EXISTS developer_website_url text,
ADD COLUMN IF NOT EXISTS compatibility text DEFAULT 'Web',
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{English}'::text[],
ADD COLUMN IF NOT EXISTS has_in_app_purchases boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing apps to set user_id to null (admin apps)
-- New apps will require user_id

-- Create new RLS policies for user app ownership
-- Drop existing restrictive policies first
DROP POLICY IF EXISTS "Admins can insert apps" ON public.apps;
DROP POLICY IF EXISTS "Admins can update apps" ON public.apps;
DROP POLICY IF EXISTS "Admins can delete apps" ON public.apps;

-- Allow authenticated users to insert their own apps
CREATE POLICY "Users can insert their own apps"
ON public.apps
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own apps OR admins can update any app
CREATE POLICY "Users can update own apps or admins any"
ON public.apps
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Allow users to delete their own apps OR admins can delete any app
CREATE POLICY "Users can delete own apps or admins any"
ON public.apps
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Update screenshots policies to allow app owners to manage screenshots
DROP POLICY IF EXISTS "Admins can insert screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Admins can update screenshots" ON public.app_screenshots;
DROP POLICY IF EXISTS "Admins can delete screenshots" ON public.app_screenshots;

-- Allow users to insert screenshots for their own apps
CREATE POLICY "Users can insert screenshots for own apps"
ON public.app_screenshots
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = app_screenshots.app_id 
    AND (apps.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Allow users to update screenshots for their own apps
CREATE POLICY "Users can update screenshots for own apps"
ON public.app_screenshots
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = app_screenshots.app_id 
    AND (apps.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Allow users to delete screenshots for their own apps
CREATE POLICY "Users can delete screenshots for own apps"
ON public.app_screenshots
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = app_screenshots.app_id 
    AND (apps.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Update storage policies to allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view uploaded files" ON storage.objects;

CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'app-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'app-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view uploaded files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'app-assets');