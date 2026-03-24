'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateBlogForm() {
  const [blogTitle, setBlogTitle] = useState('')
  const [blogSlug, setBlogSlug] = useState('')
  const [blogExcerpt, setBlogExcerpt] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [status, setStatus] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const handlePostBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Posting...')
    
    const safeSlug = blogSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const { error } = await supabase.from('blogs').insert({
      title: blogTitle,
      slug: safeSlug,
      excerpt: blogExcerpt,
      content: blogContent
    })

    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Just posted! Ready for another.')
      setBlogTitle('')
      setBlogSlug('')
      setBlogExcerpt('')
      setBlogContent('')
      router.refresh() // Instructs Next.js to re-fetch the server component data
    }
  }

  if (!isExpanded) {
    return (
      <button onClick={() => setIsExpanded(true)} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        + Write a New Article
      </button>
    )
  }

  return (
    <div className="glass-card" style={{ marginBottom: '3rem', border: '1px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Create New Article</h2>
        <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontSize: '1.2rem' }}>✕</button>
      </div>

      {status && <div style={{ padding: '1rem', background: '#e8f0fe', color: '#1a73e8', borderRadius: '4px', marginBottom: '1.5rem', fontWeight: 500 }}>{status}</div>}

      <form onSubmit={handlePostBlog} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <input className="input-field" placeholder="Title" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
        <input className="input-field" placeholder="Slug (e.g., my-first-post)" value={blogSlug} onChange={e => setBlogSlug(e.target.value)} required />
        <textarea className="input-field" placeholder="Short Excerpt" value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)} rows={2} required />
        <textarea className="input-field" placeholder="Full Content (Markdown or Text)" value={blogContent} onChange={e => setBlogContent(e.target.value)} rows={12} required />
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Publish Post</button>
      </form>
    </div>
  )
}
