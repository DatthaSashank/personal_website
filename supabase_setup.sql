-- Copy and paste this entirely into the Supabase SQL Editor and click "Run"

-- 1. Create Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Profiles Table (for About page sections)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL
);

-- 3. Insert initial dynamic profile data
INSERT INTO public.profiles (section_key, title, content)
VALUES 
  ('personal', 'Personal Story', 'I am a passionate technologist exploring software architecture and AI.'),
  ('professional', 'Professional Journey', 'Senior Software Engineer leading architecture for scalable web applications.'),
  ('certifications', 'Certifications', 'AWS Solutions Architect, React Advanced Certification')
ON CONFLICT (section_key) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Temporary open allow for prototyping CMS)
-- Warning: In a production app, these INSERT/UPDATE policies should be restricted to authenticated users only!
CREATE POLICY "Allow public select on blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on blogs" ON public.blogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on blogs" ON public.blogs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on blogs" ON public.blogs FOR DELETE USING (true);

CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);
