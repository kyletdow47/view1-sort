'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Send,
  MessageSquare,
  ChevronDown,
  AlertTriangle,
  Crop,
  Sun,
  Palette,
  Scissors,
  HelpCircle,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type CommentType = 'general' | 'revision'
type RevisionCategory = 'exposure' | 'crop' | 'color' | 'remove_object' | 'other'

interface Comment {
  id: string
  authorName: string
  authorRole: 'client' | 'photographer'
  text: string
  type: CommentType
  revisionCategory?: RevisionCategory
  timestamp: Date
  replies: Reply[]
}

interface Reply {
  id: string
  authorName: string
  authorRole: 'client' | 'photographer'
  text: string
  timestamp: Date
}

/* ─── Mock data ──────────────────────────────────────────────────────────── */

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    authorName: 'Sarah Johnson',
    authorRole: 'client',
    text: 'I love this photo! The lighting is perfect. Can we definitely include this one?',
    type: 'general',
    timestamp: new Date(Date.now() - 3600000 * 2),
    replies: [
      {
        id: 'r1',
        authorName: 'You',
        authorRole: 'photographer',
        text: "Absolutely, this is one of my favorites from the day too!",
        timestamp: new Date(Date.now() - 3600000),
      },
    ],
  },
  {
    id: 'c2',
    authorName: 'Sarah Johnson',
    authorRole: 'client',
    text: 'Could you brighten this one a little? It feels slightly dark on the left side.',
    type: 'revision',
    revisionCategory: 'exposure',
    timestamp: new Date(Date.now() - 1800000),
    replies: [],
  },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

const REVISION_ICONS: Record<RevisionCategory, React.ElementType> = {
  exposure: Sun,
  crop: Crop,
  color: Palette,
  remove_object: Scissors,
  other: HelpCircle,
}

const REVISION_LABELS: Record<RevisionCategory, string> = {
  exposure: 'Exposure',
  crop: 'Crop/Framing',
  color: 'Color grade',
  remove_object: 'Remove object',
  other: 'Other',
}

/* ─── Comment bubble ─────────────────────────────────────────────────────── */

function CommentBubble({
  comment,
  onReply,
}: {
  comment: Comment
  onReply: (id: string, text: string) => void
}) {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const submitReply = () => {
    if (!replyText.trim()) return
    onReply(comment.id, replyText.trim())
    setReplyText('')
    setReplying(false)
  }

  const isPhotographer = comment.authorRole === 'photographer'
  const RevIcon = comment.revisionCategory ? REVISION_ICONS[comment.revisionCategory] : null

  return (
    <div className="space-y-2">
      <div className={['flex gap-2.5', isPhotographer ? 'flex-row-reverse' : ''].join(' ')}>
        {/* Avatar */}
        <div className={['w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0', isPhotographer ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'].join(' ')}>
          {comment.authorName[0]}
        </div>

        <div className={['flex-1', isPhotographer ? 'items-end' : 'items-start'].join(' ')}>
          <div className={['flex items-center gap-2 mb-1', isPhotographer ? 'flex-row-reverse' : ''].join(' ')}>
            <span className="text-[10px] font-mono font-bold text-on-surface-variant/60">
              {comment.authorName}
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant/30">
              {timeAgo(comment.timestamp)}
            </span>
          </div>

          {/* Revision tag */}
          {comment.type === 'revision' && comment.revisionCategory && RevIcon && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold rounded-full uppercase tracking-widest">
                <AlertTriangle className="w-2.5 h-2.5" />
                Revision · {REVISION_LABELS[comment.revisionCategory]}
              </span>
            </div>
          )}

          <div className={['max-w-[85%] px-3 py-2 rounded-2xl text-sm text-on-surface', isPhotographer ? 'bg-primary/15 ml-auto' : 'bg-surface-container-high'].join(' ')}>
            {comment.text}
          </div>

          <button
            onClick={() => setReplying(!replying)}
            className="text-[10px] font-mono text-on-surface-variant/40 hover:text-on-surface-variant mt-1 transition-colors"
          >
            Reply
          </button>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-9 space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className={['flex gap-2', reply.authorRole === 'photographer' ? 'flex-row-reverse' : ''].join(' ')}>
              <div className={['w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold flex-shrink-0', reply.authorRole === 'photographer' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'].join(' ')}>
                {reply.authorName[0]}
              </div>
              <div className={['px-2.5 py-1.5 rounded-xl text-xs text-on-surface bg-surface-container', reply.authorRole === 'photographer' ? 'bg-primary/10' : ''].join(' ')}>
                {reply.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {replying && (
        <div className="ml-9 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitReply()}
            placeholder="Write a reply…"
            autoFocus
            className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={submitReply}
            disabled={!replyText.trim()}
            className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main panel ─────────────────────────────────────────────────────────── */

interface PhotoCommentPanelProps {
  photoId: string
  photoName: string
  onClose: () => void
}

export function PhotoCommentPanel({ photoId, photoName, onClose }: PhotoCommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [text, setText] = useState('')
  const [commentType, setCommentType] = useState<CommentType>('general')
  const [revisionCategory, setRevisionCategory] = useState<RevisionCategory>('exposure')
  const [showRevCats, setShowRevCats] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const submit = () => {
    if (!text.trim()) return
    const newComment: Comment = {
      id: `c${Date.now()}`,
      authorName: 'You',
      authorRole: 'photographer',
      text: text.trim(),
      type: commentType,
      revisionCategory: commentType === 'revision' ? revisionCategory : undefined,
      timestamp: new Date(),
      replies: [],
    }
    setComments((prev) => [...prev, newComment])
    setText('')
  }

  const addReply = (commentId: string, replyText: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: `r${Date.now()}`,
                  authorName: 'You',
                  authorRole: 'photographer',
                  text: replyText,
                  timestamp: new Date(),
                },
              ],
            }
          : c,
      ),
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-low border-l border-outline-variant/20 w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-headline font-bold text-on-surface">Comments</p>
            <p className="text-[10px] font-mono text-on-surface-variant/40 truncate max-w-[160px]">{photoName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {comments.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="w-8 h-8 text-on-surface-variant/20 mx-auto mb-2" />
            <p className="text-xs font-mono text-on-surface-variant/40">No comments yet</p>
          </div>
        ) : (
          comments.map((c) => (
            <CommentBubble key={c.id} comment={c} onReply={addReply} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="p-3 border-t border-outline-variant/10 space-y-2">
        {/* Type toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setCommentType('general')}
            className={['flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all', commentType === 'general' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'].join(' ')}
          >
            Comment
          </button>
          <button
            onClick={() => setCommentType('revision')}
            className={['flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1', commentType === 'revision' ? 'bg-amber-500/20 text-amber-400' : 'text-on-surface-variant/40 hover:text-on-surface-variant'].join(' ')}
          >
            <AlertTriangle className="w-3 h-3" />
            Revision
          </button>
        </div>

        {/* Revision category selector */}
        {commentType === 'revision' && (
          <div className="relative">
            <button
              onClick={() => setShowRevCats(!showRevCats)}
              className="w-full flex items-center justify-between px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-xl text-xs font-mono text-on-surface"
            >
              <span className="flex items-center gap-2">
                {React.createElement(REVISION_ICONS[revisionCategory], { className: 'w-3.5 h-3.5 text-amber-400' })}
                {REVISION_LABELS[revisionCategory]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant/40" />
            </button>
            {showRevCats && (
              <div className="absolute bottom-full mb-1 left-0 right-0 z-10 bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden shadow-xl">
                {(Object.keys(REVISION_LABELS) as RevisionCategory[]).map((cat) => {
                  const Icon = REVISION_ICONS[cat]
                  return (
                    <button
                      key={cat}
                      onClick={() => { setRevisionCategory(cat); setShowRevCats(false) }}
                      className={['w-full flex items-center gap-2 px-3 py-2 text-xs font-mono transition-colors hover:bg-surface-container-high', cat === revisionCategory ? 'text-amber-400' : 'text-on-surface-variant'].join(' ')}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {REVISION_LABELS[cat]}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Text input */}
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="Write a comment…"
            rows={2}
            className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="p-2 rounded-xl bg-primary text-on-primary self-end hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] font-mono text-on-surface-variant/30">↵ to send · shift+↵ for new line</p>
      </div>
    </div>
  )
}
