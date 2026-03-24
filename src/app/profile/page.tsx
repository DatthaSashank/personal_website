'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfileDashboard() {
  const [sectionKey, setSectionKey] = useState('personal')
  const [profileContent, setProfileContent] = useState('')
  const [status, setStatus] = useState('')

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
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 600 }}>Profile Manager</h1>
      
      {status && <div style={{ padding: '1rem', background: '#e8f0fe', color: '#1a73e8', borderRadius: '4px', marginBottom: '1.5rem', fontWeight: 500 }}>{status}</div>}

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
    </div>
  )
}
