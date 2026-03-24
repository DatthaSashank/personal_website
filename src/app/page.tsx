import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ marginTop: '2rem' }}>
      <header style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '600', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          Exploring Software Architecture & AI.
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          I'm Dattha Sashank, a professional software engineer focused on building highly scalable web ecosystems and autonomous AI agents.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href="/blog" className="btn-primary">
            Read My Articles
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600' }}>Latest Writing</h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Insights on modern engineering, design systems, and artificial intelligence.</p>
          <Link href="/blog" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>View articles &rarr;</Link>
        </div>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600' }}>Professional Journey</h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>My experience, technical certifications, and the tech stacks I work with.</p>
          <Link href="/about" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>View profile &rarr;</Link>
        </div>
      </div>
    </div>
  )
}
