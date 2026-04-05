'use client'

import { Heart, MessageCircle, Repeat2, Send, Bookmark, MoreHorizontal, ThumbsUp, Share2 } from 'lucide-react'
import type { Platform, MockPhoto } from '@/types/content'

interface PlatformPreviewProps {
  platform: Platform
  photos: MockPhoto[]
  caption: string
  hashtags: string[]
}

/* ------------------------------------------------------------------ */
/*  Instagram Preview                                                  */
/* ------------------------------------------------------------------ */

function InstagramPreview({ photos, caption, hashtags }: Omit<PlatformPreviewProps, 'platform'>) {
  const photo = photos[0]
  return (
    <div className="mx-auto max-w-[320px] overflow-hidden rounded-2xl" style={{ background: '#0D0B1A', border: '1px solid rgba(255,255,255,0.10)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600" />
          <div>
            <p className="text-[11px] font-semibold text-white">aperturestudios</p>
            <p className="text-[9px] text-white/40">Photography</p>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-white/40" />
      </div>

      {/* Photo — square crop */}
      <div className="aspect-square w-full">
        {photo ? (
          <div className={`h-full w-full bg-gradient-to-br ${photo.gradient}`} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5">
            <p className="text-[10px] text-white/30">Select a photo</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 py-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-white/70" />
            <MessageCircle className="h-5 w-5 text-white/70" />
            <Send className="h-5 w-5 text-white/70" />
          </div>
          <Bookmark className="h-5 w-5 text-white/70" />
        </div>
        <p className="mb-1 text-[10px] font-semibold text-white">342 likes</p>
        {caption ? (
          <p className="text-[10px] leading-relaxed text-white/70">
            <span className="font-semibold">aperturestudios</span>{' '}
            {caption.length > 120 ? caption.slice(0, 120) + '…' : caption}
            {hashtags.length > 0 && (
              <span className="text-blue-400"> {hashtags.slice(0, 5).map(h => `#${h}`).join(' ')}</span>
            )}
          </p>
        ) : (
          <p className="text-[10px] text-white/25 italic">Caption will appear here…</p>
        )}
        <p className="mt-1 text-[9px] uppercase tracking-wider text-white/25">2 minutes ago</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Facebook Preview                                                   */
/* ------------------------------------------------------------------ */

function FacebookPreview({ photos, caption, hashtags }: Omit<PlatformPreviewProps, 'platform'>) {
  const photo = photos[0]
  return (
    <div className="mx-auto max-w-[320px] overflow-hidden rounded-2xl" style={{ background: '#0D0B1A', border: '1px solid rgba(255,255,255,0.10)' }}>
      {/* Page header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <span className="text-[11px] font-bold text-white">AS</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-white">Aperture Studios</p>
          <p className="text-[9px] text-white/40">Photography · Just now · <span className="text-blue-400">🌐</span></p>
        </div>
        <MoreHorizontal className="ml-auto h-4 w-4 text-white/40" />
      </div>

      {/* Caption above photo */}
      {caption ? (
        <div className="px-3 pb-2">
          <p className="text-[11px] leading-relaxed text-white/80">
            {caption.length > 140 ? caption.slice(0, 140) + '…' : caption}
            {hashtags.length > 0 && (
              <span className="text-blue-400"> {hashtags.slice(0, 3).map(h => `#${h}`).join(' ')}</span>
            )}
          </p>
        </div>
      ) : (
        <p className="px-3 pb-2 text-[10px] text-white/25 italic">Caption will appear here…</p>
      )}

      {/* Photo — 4:3 landscape */}
      <div className="w-full" style={{ aspectRatio: '4/3' }}>
        {photo ? (
          <div className={`h-full w-full bg-gradient-to-br ${photo.gradient}`} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5">
            <p className="text-[10px] text-white/30">Select a photo</p>
          </div>
        )}
      </div>

      {/* Engagement bar */}
      <div className="px-3 py-2">
        <div className="mb-2 flex items-center justify-between text-[9px] text-white/35">
          <span>👍 142 · ❤️ 38</span>
          <span>12 comments · 5 shares</span>
        </div>
        <div className="border-t border-white/8 pt-2 flex items-center justify-around">
          {[
            { icon: ThumbsUp, label: 'Like' },
            { icon: MessageCircle, label: 'Comment' },
            { icon: Share2, label: 'Share' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TikTok Preview                                                     */
/* ------------------------------------------------------------------ */

function TikTokPreview({ photos, caption, hashtags }: Omit<PlatformPreviewProps, 'platform'>) {
  const photo = photos[0]
  return (
    <div className="mx-auto max-w-[200px] overflow-hidden rounded-2xl" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.10)', aspectRatio: '9/16', position: 'relative' }}>
      {/* Background photo — full bleed */}
      {photo ? (
        <div className={`absolute inset-0 bg-gradient-to-br ${photo.gradient}`} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-[10px] text-white/30">Select a photo</p>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 40%, transparent 100%)' }} />

      {/* Right actions */}
      <div className="absolute bottom-16 right-2 flex flex-col items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600" />
        <Heart className="h-5 w-5 text-white" />
        <MessageCircle className="h-5 w-5 text-white" />
        <Repeat2 className="h-5 w-5 text-white" />
        <Bookmark className="h-5 w-5 text-white" />
      </div>

      {/* Bottom caption */}
      <div className="absolute bottom-3 left-2 right-10">
        <p className="text-[10px] font-semibold text-white">@aperturestudios</p>
        {caption ? (
          <p className="mt-0.5 text-[9px] leading-relaxed text-white/80">
            {caption.length > 80 ? caption.slice(0, 80) + '…' : caption}
          </p>
        ) : (
          <p className="mt-0.5 text-[9px] text-white/40 italic">Caption here…</p>
        )}
        {hashtags.length > 0 && (
          <p className="mt-0.5 text-[9px] text-white/60">{hashtags.slice(0, 4).map(h => `#${h}`).join(' ')}</p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pinterest Preview                                                  */
/* ------------------------------------------------------------------ */

function PinterestPreview({ photos, caption }: Omit<PlatformPreviewProps, 'platform'>) {
  const photo = photos[0]
  return (
    <div className="mx-auto max-w-[240px] overflow-hidden rounded-2xl" style={{ background: '#0D0B1A', border: '1px solid rgba(255,255,255,0.10)' }}>
      {/* Photo — 2:3 portrait */}
      <div className="w-full" style={{ aspectRatio: '2/3' }}>
        {photo ? (
          <div className={`h-full w-full bg-gradient-to-br ${photo.gradient}`} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5">
            <p className="text-[10px] text-white/30">Select a photo</p>
          </div>
        )}
      </div>
      {/* Pin info */}
      <div className="p-3">
        {caption ? (
          <p className="text-[11px] font-medium leading-snug text-white/85">
            {caption.length > 80 ? caption.slice(0, 80) + '…' : caption}
          </p>
        ) : (
          <p className="text-[10px] text-white/25 italic">Title / caption here…</p>
        )}
        <p className="mt-1.5 text-[9px] text-white/35">aperturestudios.com</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function PlatformPreview(props: PlatformPreviewProps) {
  switch (props.platform) {
    case 'instagram':
      return <InstagramPreview photos={props.photos} caption={props.caption} hashtags={props.hashtags} />
    case 'facebook':
      return <FacebookPreview photos={props.photos} caption={props.caption} hashtags={props.hashtags} />
    case 'tiktok':
      return <TikTokPreview photos={props.photos} caption={props.caption} hashtags={props.hashtags} />
    case 'pinterest':
      return <PinterestPreview photos={props.photos} caption={props.caption} hashtags={props.hashtags} />
    default:
      return null
  }
}
