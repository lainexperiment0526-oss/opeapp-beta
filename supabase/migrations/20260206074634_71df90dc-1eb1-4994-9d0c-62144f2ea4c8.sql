
-- Reviews/Ratings table
CREATE TABLE public.app_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);

ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.app_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.app_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.app_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.app_reviews FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks table
CREATE TABLE public.app_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);

ALTER TABLE public.app_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.app_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.app_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.app_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- App feedback table
CREATE TABLE public.app_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON public.app_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "App owners and admins can view feedback" ON public.app_feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM apps WHERE apps.id = app_feedback.app_id AND (apps.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
);
CREATE POLICY "Users can insert feedback" ON public.app_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update app average rating when reviews change
CREATE OR REPLACE FUNCTION public.update_app_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.apps SET
      average_rating = COALESCE((SELECT AVG(rating)::numeric FROM public.app_reviews WHERE app_id = OLD.app_id), 0),
      ratings_count = (SELECT COUNT(*) FROM public.app_reviews WHERE app_id = OLD.app_id)
    WHERE id = OLD.app_id;
    RETURN OLD;
  ELSE
    UPDATE public.apps SET
      average_rating = COALESCE((SELECT AVG(rating)::numeric FROM public.app_reviews WHERE app_id = NEW.app_id), 0),
      ratings_count = (SELECT COUNT(*) FROM public.app_reviews WHERE app_id = NEW.app_id)
    WHERE id = NEW.app_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_app_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.app_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_app_rating();

-- Trigger for updated_at on reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.app_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
