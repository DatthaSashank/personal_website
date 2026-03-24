import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dattha Sashank',
  description: 'Professional Portfolio & Blog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem', 
          borderBottom: '1px solid var(--card-border)',
          background: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--foreground)' }}>
            Dattha Sashank
          </Link>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Home</Link>
            <Link href="/about" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>About</Link>
            <Link href="/blog" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>Articles</Link>
            <Link href="/profile" className="btn-secondary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}>Profile</Link>
          </nav>
        </header>
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
