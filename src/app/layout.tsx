import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Colorful Creator',
  description: 'My personalized AI ecosystem and blog',
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
          padding: '1.5rem 3rem', 
          borderBottom: '1px solid var(--card-border)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <Link href="/" className="colorful-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
            Dattha Sashank
          </Link>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <Link href="/about" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: '500' }}>About</Link>
            <Link href="/blog" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: '500' }}>Blog</Link>
          </nav>
        </header>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
