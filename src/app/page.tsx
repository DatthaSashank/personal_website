import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1 className="colorful-text" style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
        Welcome to My Digital Space
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
        A personal hub documenting my journey through code, future AI experiments, and creative writing. Feel free to explore and interact.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '6rem' }}>
        <Link href="/about" className="btn-primary">
          Meet the Creator
        </Link>
        <Link href="/blog" className="btn-primary" style={{ background: 'var(--card)', border: '1px solid var(--card-border)' }}>
          Read the Blog
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Deep Dives</h2>
          <p style={{ color: '#94a3b8' }}>Explore my technical articles and tutorials on everything from React to the latest AI tech.</p>
        </div>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Who Am I?</h2>
          <p style={{ color: '#94a3b8' }}>Check out my professional background, certifications, and what drives my passion for technology.</p>
        </div>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>Future AI Hub</h2>
          <p style={{ color: '#94a3b8' }}>This ecosystem is built as a stable foundation for deploying personal AI agents and interactive projects.</p>
        </div>
      </div>
    </div>
  )
}
