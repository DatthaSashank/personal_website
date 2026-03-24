'use client'
import { useState } from 'react'

export default function EmojiReaction() {
  const [reactions, setReactions] = useState({
    like: 0,
    fire: 0,
    mindblown: 0,
    heart: 0
  })

  const emojis = [
    { key: 'like', symbol: '👍' },
    { key: 'fire', symbol: '🔥' },
    { key: 'mindblown', symbol: '🤯' },
    { key: 'heart', symbol: '❤️' }
  ]

  const handleReact = (key: keyof typeof reactions) => {
    setReactions(prev => ({
      ...prev,
      [key]: prev[key] + 1
    }))
  }

  return (
    <div className="glass-card" style={{ marginTop: '3rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>React to this post:</span>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {emojis.map((emoji) => (
          <button
            key={emoji.key}
            onClick={() => handleReact(emoji.key as keyof typeof reactions)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)',
              borderRadius: '9999px',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'var(--foreground)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{emoji.symbol}</span>
            <span style={{ fontWeight: 'bold' }}>{reactions[emoji.key as keyof typeof reactions]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
