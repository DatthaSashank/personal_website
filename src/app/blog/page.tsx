import Link from 'next/link'

const blogs = [
  {
    slug: 'future-of-ai-agents',
    title: 'The Future of AI Agents in Web Ecosystems',
    excerpt: 'Exploring how autonomous agents will transform personal websites into interactive digital twins.',
    date: 'March 24, 2026',
    color: 'var(--primary)'
  },
  {
    slug: 'building-colorful-uis',
    title: 'Building Vibrant UIs with Vanilla CSS',
    excerpt: 'Why sometimes stepping away from utility frameworks can lead to more creative, glowing designs.',
    date: 'March 20, 2026',
    color: 'var(--secondary)'
  }
]

export default function BlogIndex() {
  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <h1 className="colorful-text" style={{ fontSize: '3rem', marginBottom: '2rem' }}>My Thoughts</h1>
      
      <div style={{ display: 'grid', gap: '2rem' }}>
        {blogs.map(blog => (
          <Link href={`/blog/${blog.slug}`} key={blog.slug} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ borderLeft: `4px solid ${blog.color}` }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{blog.title}</h2>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>{blog.date}</div>
              <p style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{blog.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
