import EmojiReaction from '@/components/EmojiReaction'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const blogs = {
  'future-of-ai-agents': {
    title: 'The Future of AI Agents in Web Ecosystems',
    date: 'March 24, 2026',
    content: 'As we move towards more intelligent web experiences, the role of static websites is diminishing. Personal websites will soon act as digital twins—autonomous AI agents capable of interacting with visitors on our behalf. This site serves as a foundation for exactly that...'
  },
  'building-colorful-uis': {
    title: 'Building Vibrant UIs with Vanilla CSS',
    date: 'March 20, 2026',
    content: 'While utility classes are great for speed, sometimes you want full control over glow effects, backdrop filters, and complex gradients. By returning to CSS variables and vanilla CSS, we can create incredibly vibrant, optimized glassmorphism interfaces...'
  }
}

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const post = blogs[slug as keyof typeof blogs];

  if (!post) {
    notFound();
  }

  return (
    <article style={{ animation: 'fadeIn 0.5s', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/blog" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to all posts
      </Link>
      
      <h1 className="colorful-text" style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>
        {post.title}
      </h1>
      
      <div style={{ color: '#94a3b8', marginBottom: '3rem' }}>{post.date}</div>
      
      <div style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#e2e8f0' }}>
        {post.content}
      </div>

      <EmojiReaction />
    </article>
  )
}
