'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('blogs')
  
  // Blog Form State
  const [blogTitle, setBlogTitle] = useState('')
  const [blogSlug, setBlogSlug] = useState('')
  const [blogExcerpt, setBlogExcerpt] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [status, setStatus] = useState('')

  // Profile Form State
  const [sectionKey, setSectionKey] = useState('personal')
  const [profileContent, setProfileContent] = useState('')

  const handlePostBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Posting...')
    
    const { error } = await supabase.from('blogs').insert({
      title: blogTitle,
      slug: blogSlug,
      excerpt: blogExcerpt,
      content: blogContent
    })

    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Blog posted successfully!')
      setBlogTitle('')
      setBlogSlug('')
      setBlogExcerpt('')
      setBlogContent('')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Updating profile...')
    
    const { error } = await supabase.from('profiles').update({ content: profileContent }).eq('section_key', sectionKey)
    
    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Profile section updated successfully!')
      setProfileContent('')
    }
  }

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 600 }}>Admin Content Manager</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <button className={activeTab === 'blogs' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('blogs')}>
          Publish Blogs
        </button>
        <button className={activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('profile')}>
          Update Profile Details
        </button>
      </div>

      {status && <div style={{ padding: '1rem', background: '#e8f0fe', color: '#1a73e8', borderRadius: '4px', marginBottom: '1.5rem', fontWeight: 500 }}>{status}</div>}

      {activeTab === 'blogs' && (
        <form onSubmit={handlePostBlog} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Create New Blog Post</h2>
          <input className="input-field" placeholder="Title" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
          <input className="input-field" placeholder="Slug (e.g., my-first-post)" value={blogSlug} onChange={e => setBlogSlug(e.target.value)} required />
          <textarea className="input-field" placeholder="Short Excerpt" value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value)} rows={2} required />
          <textarea className="input-field" placeholder="Full Content (Markdown or Text)" value={blogContent} onChange={e => setBlogContent(e.target.value)} rows={12} required />
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Publish Post to Database</button>
        </form>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Update About Me Sections</h2>
          <select className="input-field" value={sectionKey} onChange={e => setSectionKey(e.target.value)}>
            <option value="personal">Personal Story</option>
            <option value="professional">Professional Journey</option>
            <option value="certifications">Certifications</option>
          </select>
          <textarea className="input-field" placeholder="New Content for this section..." value={profileContent} onChange={e => setProfileContent(e.target.value)} rows={8} required />
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Update Database Section</button>
        </form>
      )}
    </div>
  )
}
