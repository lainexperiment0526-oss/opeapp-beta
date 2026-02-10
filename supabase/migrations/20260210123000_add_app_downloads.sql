-- Track unique app downloads per user and increment apps.downloads_count

CREATE TABLE IF NOT EXISTS public.app_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, user_id)
);

ALTER TABLE public.app_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own downloads"
ON public.app_downloads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_app_downloads()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.apps
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = NEW.app_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_downloads_increment ON public.app_downloads;

CREATE TRIGGER app_downloads_increment
AFTER INSERT ON public.app_downloads
FOR EACH ROW
EXECUTE FUNCTION public.increment_app_downloads();
