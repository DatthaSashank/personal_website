import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CreateBlogForm from '@/components/CreateBlogForm'

// Ensure this page is completely dynamic so it fetches the latest blogs on every request
export const revalidate = 0;

export default async function BlogIndex() {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('title, slug, excerpt, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching blogs:", error);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0 }}>Latest Articles</h1>
      </div>

      <CreateBlogForm />
      
      {!blogs || blogs.length === 0 ? (
        <p style={{ color: 'var(--secondary)' }}>No articles published yet. Use the Admin dashboard to write one!</p>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {blogs.map(blog => (
            <Link href={`/blog/${blog.slug}`} key={blog.slug} style={{ textDecoration: 'none' }}>
              <div className="glass-card">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{blog.title}</h2>
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <p style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>{blog.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
