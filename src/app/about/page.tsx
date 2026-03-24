export default function About() {
  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <h1 className="colorful-text" style={{ fontSize: '3rem', marginBottom: '2rem' }}>About Me</h1>
      
      <div style={{ display: 'grid', gap: '2rem' }}>
        <section className="glass-card">
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>Personal Story</h2>
          <p style={{ lineHeight: 1.6, color: '#e2e8f0' }}>
            I am a passionate technologist, constantly exploring the intersections of software architecture and Artificial Intelligence. This website serves as a canvas for my ideas, professional journey, and experimental AI agents.
          </p>
        </section>

        <section className="glass-card">
          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '1rem' }}>Professional Journey</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '1.5rem', borderLeft: '3px solid var(--secondary)', paddingLeft: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Senior Software Engineer</h3>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>2021 - Present</span>
              <p style={{ marginTop: '0.5rem', color: '#e2e8f0' }}>Leading architecture for scalable web applications and exploring AI integrations.</p>
            </li>
            <li style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Full Stack Developer</h3>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>2018 - 2021</span>
              <p style={{ marginTop: '0.5rem', color: '#e2e8f0' }}>Developed robust ecosystems using React, Node.js, and Cloud Infrastructure.</p>
            </li>
          </ul>
        </section>

        <section className="glass-card">
          <h2 style={{ fontSize: '1.8rem', color: 'var(--accent)', marginBottom: '1rem' }}>Certifications</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--accent)' }}>AWS Solutions Architect</span>
            <span style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--accent)' }}>React Advanced Certification</span>
            <span style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--accent)' }}>Generative AI Fundamentals</span>
          </div>
        </section>
      </div>
    </div>
  )
}
