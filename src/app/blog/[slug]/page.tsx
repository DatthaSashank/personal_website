import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import BlogReaderClient from '@/components/BlogReaderClient';

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const supabase = await createClient();

  // Fetch article details
  const { data: post, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Get viewer session and profile for authorization
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <BlogReaderClient
      blog={post}
      isAdmin={profile?.role === 'Admin'}
      currentUserId={user?.id || ''}
    />
  );
}
