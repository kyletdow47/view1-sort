'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { GalleryTheme } from '@/types/supabase'

interface GalleryPasswordGateProps {
  galleryId: string
  galleryTitle: string
  theme: GalleryTheme
  photographerName: string
  photographerLogo: string | null
  invalidToken?: boolean
}

const themeConfig: Record<
  GalleryTheme,
  {
    bg: string
    cardBg: string
    text: string
    muted: string
    accent: string
    accentText: string
    inputBg: string
    border: string
    font: string
  }
> = {
  dark: {
    bg: '#0c0c0e',
    cardBg: '#1a1a1d',
    text: '#f0f0f0',
    muted: '#8a8a8a',
    accent: '#22c55e',
    accentText: '#000',
    inputBg: '#0c0c0e',
    border: '#2a2a2e',
    font: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  light: {
    bg: '#ffffff',
    cardBg: '#f9fafb',
    text: '#111827',
    muted: '#6b7280',
    accent: '#2563eb',
    accentText: '#fff',
    inputBg: '#ffffff',
    border: '#d1d5db',
    font: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  minimal: {
    bg: '#f9fafb',
    cardBg: '#ffffff',
    text: '#1f2937',
    muted: '#9ca3af',
    accent: '#111827',
    accentText: '#fff',
    inputBg: '#ffffff',
    border: '#e5e7eb',
    font: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  editorial: {
    bg: '#1c1917',
    cardBg: '#292524',
    text: '#fafaf9',
    muted: '#78716c',
    accent: '#e7c08a',
    accentText: '#1c1917',
    inputBg: '#1c1917',
    border: '#3c3330',
    font: 'Georgia, Times New Roman, serif',
  },
}

export function GalleryPasswordGate({
  galleryId,
  galleryTitle,
  theme,
  photographerName,
  photographerLogo,
  invalidToken = false,
}: GalleryPasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(
    invalidToken ? 'Your access link has expired. Please enter the gallery password.' : null
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const c = themeConfig[theme]
  const isEditorial = theme === 'editorial'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // TODO: implement POST /api/gallery/[galleryId]/unlock
      const res = await fetch(`/api/gallery/${galleryId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Incorrect password.')
        return
      }

      const data = await res.json() as { token: string }
      router.push(`/gallery/${galleryId}?token=${data.token}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.bg,
        fontFamily: c.font,
        padding: '2rem',
      }}
    >
      {/* Photographer branding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          marginBottom: '2.5rem',
        }}
      >
        {photographerLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photographerLogo}
            alt={photographerName}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: c.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: c.accentText,
            }}
          >
            {photographerName.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: c.text }}>
          {photographerName}
        </span>
      </div>

      {/* Password card */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: c.cardBg,
          borderRadius: isEditorial ? 0 : '0.875rem',
          padding: '2.5rem',
          border: `1px solid ${c.border}`,
        }}
      >
        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: isEditorial ? 400 : 700,
            fontStyle: isEditorial ? 'italic' : 'normal',
            color: c.text,
            marginBottom: '0.375rem',
            lineHeight: 1.2,
          }}
        >
          {galleryTitle}
        </h1>
        <p style={{ fontSize: '0.875rem', color: c.muted, marginBottom: '1.75rem' }}>
          This gallery is password protected. Enter the password to view your photos.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="gallery-password"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: c.text,
                marginBottom: '0.375rem',
              }}
            >
              Password
            </label>
            <input
              id="gallery-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter gallery password"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                backgroundColor: c.inputBg,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: isEditorial ? 0 : '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p
              role="alert"
              style={{ fontSize: '0.8125rem', color: '#ef4444', marginBottom: '1rem' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: c.accent,
              color: c.accentText,
              border: 'none',
              borderRadius: isEditorial ? 0 : '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !password.trim() ? 0.65 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Checking…' : 'View Gallery'}
          </button>
        </form>
      </div>
    </div>
  )
}
