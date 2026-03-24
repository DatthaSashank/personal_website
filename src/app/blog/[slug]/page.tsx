import EmojiReaction from '@/components/EmojiReaction'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const revalidate = 0;

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  
  const { data: post, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <article style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Link href="/blog" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', fontWeight: 500 }}>
        &larr; Back to all articles
      </Link>
      
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.02em' }}>
        {post.title}
      </h1>
      
      <div style={{ color: 'var(--secondary)', marginBottom: '3rem', fontSize: '1rem' }}>
        {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <div className="article-content">
        {post.content.split('\n').map((paragraph: string, idx: number) => {
          if (!paragraph.trim()) return null;
          return <p key={idx}>{paragraph}</p>;
        })}
      </div>

      <EmojiReaction />
    </article>
  )
}
