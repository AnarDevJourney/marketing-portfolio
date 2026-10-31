import { Fragment, type ReactNode } from 'react'

/**
 * Tiny markdown renderer for admin-written text (bio etc.): paragraphs,
 * line breaks, **bold**, *italic* and [links](https://…). It builds React
 * elements and never injects HTML, so the content cannot run scripts —
 * a stricter guarantee than sanitizing an HTML string.
 */
export function renderMarkdown(source: string, className?: string): ReactNode {
  return source
    .trim()
    .split(/\n{2,}/)
    .map((para, i) => (
      <p key={i} className={className}>
        {para.split('\n').map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {inline(line)}
          </Fragment>
        ))}
      </p>
    ))
}

const SAFE_URL = /^(https?:\/\/|mailto:)/i
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g

function inline(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (link) {
      const [, label, href] = link
      return SAFE_URL.test(href) ? (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-primary underline-offset-4 hover:text-primary"
        >
          {label}
        </a>
      ) : (
        label
      )
    }
    return part
  })
}
