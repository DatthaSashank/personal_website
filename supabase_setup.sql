-- Supabase Database Setup Script
-- Copy and paste this entirely into the Supabase SQL Editor and click "Run"

-- =========================================================================
-- 1. CLEANUP (Force recreation of all tables and triggers)
-- =========================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS protect_profile_roles_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.protect_profile_roles();
DROP TABLE IF EXISTS public.access_requests CASCADE;
DROP TABLE IF EXISTS public.certifications CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.blog_reactions CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.blogs CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.otps CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.about_sections CASCADE;

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'Public' CHECK (role IN ('Admin', 'Personal_Viewer', 'Professional_Viewer', 'Public')),
  has_personal_access boolean DEFAULT false,
  has_professional_access boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- About Sections Table (Dynamic text sections for the About page)
CREATE TABLE IF NOT EXISTS public.about_sections (
  section_key text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL
);

-- Blogs Table (Gated under Personal Tab)
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments Table (Nested comment thread on Blogs)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id uuid REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Reactions Table (Likes/Hearts/etc.)
CREATE TABLE IF NOT EXISTS public.blog_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id uuid REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'fire', 'mindblown', 'heart')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(blog_id, user_id, reaction_type)
);

-- Projects Table (Gated under Professional Tab - Bento Grid)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  content text,
  image_url text,
  tags text, -- Comma-separated tags, e.g. "React,Next.js,Supabase"
  project_url text,
  github_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Certifications Table (Gated under Professional Tab)
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date date,
  credential_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- One-Time Passwords (OTP) Table
CREATE TABLE IF NOT EXISTS public.otps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Sessions (Tracks OTP-verified sessions)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  otp_verified boolean DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Access Requests Table
CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('personal', 'professional', 'both')),
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. INSERT DYNAMIC INITIAL DATA
-- =========================================================================

INSERT INTO public.about_sections (section_key, title, content)
VALUES 
  ('personal', 'Personal Story', 'I am a passionate technologist exploring software architecture, AI networks, and clean UI design paradigms.'),
  ('professional', 'Professional Journey', 'Senior Software Engineer leading architecture for scalable full-stack web applications and microservices.'),
  ('certifications', 'Certifications Summary', 'AWS Certified Solutions Architect, Advanced React Engineer, and AI Integration Expert.')
ON CONFLICT (section_key) DO NOTHING;

-- =========================================================================
-- 4. TRIGGERS & PL/PGSQL FUNCTIONS
-- =========================================================================

-- Trigger to automatically create a Profile for new Auth Signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, has_personal_access, has_professional_access)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Explorer'),
    CASE 
      WHEN NEW.email = 'dattha.sashank@gmail.com' THEN 'Admin'
      ELSE 'Public'
    END,
    CASE 
      WHEN NEW.email = 'dattha.sashank@gmail.com' THEN true
      ELSE false
    END,
    CASE 
      WHEN NEW.email = 'dattha.sashank@gmail.com' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to protect roles from direct unauthorized client updates
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS trigger AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role OR
      OLD.has_personal_access IS DISTINCT FROM NEW.has_personal_access OR
      OLD.has_professional_access IS DISTINCT FROM NEW.has_professional_access) THEN
    -- Only allow changes if performed by the database owner / service role (e.g. from server API)
    IF current_setting('role', true) <> 'service_role' AND current_setting('role', true) <> 'postgres' THEN
      RAISE EXCEPTION 'Unauthorized to modify roles or permissions.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER protect_profile_roles_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

-- =========================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 6. CREATE RLS POLICIES
-- =========================================================================

-- Profiles Policies
CREATE POLICY "Profiles are readable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles can be updated by owner (name only)" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- About Sections Policies
CREATE POLICY "About sections are readable by authenticated users" ON public.about_sections
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "About sections are manageable by Admin only" ON public.about_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Blogs Policies
CREATE POLICY "Blogs are readable by users with Personal access" ON public.blogs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (has_personal_access = true OR role = 'Admin')
    )
  );

CREATE POLICY "Blogs are manageable by Admin only" ON public.blogs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Comments Policies
CREATE POLICY "Comments are readable by users with Personal access" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (has_personal_access = true OR role = 'Admin')
    )
  );

CREATE POLICY "Comments can be created by authenticated Personal viewers" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (has_personal_access = true OR role = 'Admin')
    )
  );

CREATE POLICY "Comments can be deleted by owner or Admin" ON public.comments
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Blog Reactions Policies
CREATE POLICY "Reactions are readable by users with Personal access" ON public.blog_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (has_personal_access = true OR role = 'Admin')
    )
  );

CREATE POLICY "Reactions can be toggled by authenticated Personal viewers" ON public.blog_reactions
  FOR ALL USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (has_personal_access = true OR role = 'Admin')
    )
  );

-- Projects Policies
CREATE POLICY "Projects are readable by users with Professional access" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (has_professional_access = true OR role = 'Admin')
    )
  );

CREATE POLICY "Projects are manageable by Admin only" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Certifications Policies
CREATE POLICY "Certifications are readable by users with Professional access" ON public.certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (has_professional_access = true OR role = 'Admin')
    )
  );

CREATE POLICY "Certifications are manageable by Admin only" ON public.certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Access Requests Policies
CREATE POLICY "Requests are viewable by requester" ON public.access_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Requests can be created by authenticated users" ON public.access_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
