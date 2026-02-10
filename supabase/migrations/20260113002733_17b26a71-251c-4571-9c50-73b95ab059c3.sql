-- Create app categories enum
CREATE TYPE public.app_category AS ENUM (
  'productivity', 'utilities', 'entertainment', 'social', 
  'education', 'finance', 'health', 'lifestyle', 
  'business', 'developer', 'games', 'other'
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create apps table
CREATE TABLE public.apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app screenshots table
CREATE TABLE public.app_screenshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table for secure role management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Public read policies for apps (everyone can view)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view apps" ON public.apps FOR SELECT USING (true);
CREATE POLICY "Anyone can view screenshots" ON public.app_screenshots FOR SELECT USING (true);

-- Admin-only write policies
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT 
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE 
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE 
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert apps" ON public.apps FOR INSERT 
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update apps" ON public.apps FOR UPDATE 
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete apps" ON public.apps FOR DELETE 
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert screenshots" ON public.app_screenshots FOR INSERT 
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update screenshots" ON public.app_screenshots FOR UPDATE 
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete screenshots" ON public.app_screenshots FOR DELETE 
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profile policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT 
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE 
  TO authenticated USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT 
  TO authenticated USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on apps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, icon, description) VALUES
  ('Productivity', 'Briefcase', 'Apps to boost your productivity'),
  ('Utilities', 'Settings', 'Useful utility applications'),
  ('Entertainment', 'Play', 'Fun and entertainment apps'),
  ('Social', 'Users', 'Social networking apps'),
  ('Education', 'GraduationCap', 'Learning and education apps'),
  ('Finance', 'DollarSign', 'Finance and money management'),
  ('Health', 'Heart', 'Health and fitness apps'),
  ('Lifestyle', 'Sparkles', 'Lifestyle and personal apps'),
  ('Business', 'Building', 'Business and enterprise apps'),
  ('Developer', 'Code', 'Developer tools and utilities'),
  ('Games', 'Gamepad2', 'Games and gaming apps'),
  ('Other', 'Grid3x3', 'Other applications');

-- Create storage bucket for app assets
INSERT INTO storage.buckets (id, name, public) VALUES ('app-assets', 'app-assets', true);

-- Storage policies for app assets
CREATE POLICY "Anyone can view app assets" ON storage.objects FOR SELECT USING (bucket_id = 'app-assets');
CREATE POLICY "Admins can upload app assets" ON storage.objects FOR INSERT 
  TO authenticated WITH CHECK (bucket_id = 'app-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update app assets" ON storage.objects FOR UPDATE 
  TO authenticated USING (bucket_id = 'app-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete app assets" ON storage.objects FOR DELETE 
  TO authenticated USING (bucket_id = 'app-assets' AND public.has_role(auth.uid(), 'admin'));