-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create filter_runs table
CREATE TABLE public.filter_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_profiles INTEGER NOT NULL DEFAULT 0,
  matching_profiles INTEGER NOT NULL DEFAULT 0,
  include_keywords TEXT[] DEFAULT '{}',
  exclude_keywords TEXT[] DEFAULT '{}',
  original_headers TEXT[] DEFAULT '{}',
  prompt_id TEXT,
  prompt_snapshot TEXT,
  generate_openers BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on filter_runs
ALTER TABLE public.filter_runs ENABLE ROW LEVEL SECURITY;

-- Create run_data table (stores individual rows for each run)
CREATE TABLE public.run_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.filter_runs(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL DEFAULT 0,
  row_data JSONB NOT NULL DEFAULT '{}'
);

-- Enable RLS on run_data
ALTER TABLE public.run_data ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_filter_runs_user_id ON public.filter_runs(user_id);
CREATE INDEX idx_run_data_run_id ON public.run_data(run_id);

-- Helper function to check if user owns a run
CREATE OR REPLACE FUNCTION public.is_run_owner(run_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.filter_runs
    WHERE id = run_id
      AND user_id = auth.uid()
  )
$$;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- Filter runs RLS Policies
CREATE POLICY "Users can view their own runs"
ON public.filter_runs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own runs"
ON public.filter_runs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own runs"
ON public.filter_runs FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own runs"
ON public.filter_runs FOR DELETE
USING (user_id = auth.uid());

-- Run data RLS Policies
CREATE POLICY "Users can view their run data"
ON public.run_data FOR SELECT
USING (public.is_run_owner(run_id));

CREATE POLICY "Users can insert their run data"
ON public.run_data FOR INSERT
WITH CHECK (public.is_run_owner(run_id));

CREATE POLICY "Users can delete their run data"
ON public.run_data FOR DELETE
USING (public.is_run_owner(run_id));

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profile timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();