import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownDocProps {
  filePath: string // relative to project root
  className?: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-display text-2xl font-bold text-white mt-8 mb-4 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display text-xl font-semibold text-white/90 mt-7 mb-3 pb-2 border-b border-white/[0.08]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display text-base font-semibold text-white/80 mt-5 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-display text-sm font-semibold text-white/70 mt-4 mb-1.5 uppercase tracking-wider">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-7 text-white/60 mb-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white/80">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-white/60 italic">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="my-3 space-y-1.5 pl-5 text-[15px] text-white/60 list-none">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 space-y-1.5 pl-5 text-[15px] text-white/60 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="relative before:absolute before:-left-4 before:top-[10px] before:h-1 before:w-1 before:rounded-full before:bg-violet-500/60 before:content-['']">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-violet-500/40 pl-4 text-white/50 italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code
          className="block rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-[13px] font-mono text-emerald-300/80 overflow-x-auto"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[13px] font-mono text-violet-300/90" {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/[0.04] border-b border-white/[0.08]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-[13px] text-white/60 border-t border-white/[0.04]">{children}</td>
  ),
  hr: () => <hr className="my-6 border-white/[0.08]" />,
}

export function MarkdownDoc({ filePath, className = '' }: MarkdownDocProps) {
  const absolutePath = path.join(/*turbopackIgnore: true*/ process.cwd(), filePath)

  let content = ''
  let error = ''

  try {
    content = fs.readFileSync(absolutePath, 'utf-8')
  } catch {
    error = `File not found: ${filePath}`
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 ${className}`}>
        <p className="text-sm text-white/30 font-mono">{error}</p>
        <p className="text-xs text-white/20 mt-2">This document hasn&apos;t been created yet.</p>
      </div>
    )
  }

  return (
    <div className={`min-h-0 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
