import katex from "katex"

// Splits on $$...$$ (block) and $...$ (inline) math delimiters, rendering
// each math segment with KaTeX and leaving everything else as plain text.
// katex.renderToString() has no DOM dependency, so this renders on the
// server — no client bundle cost for questions that don't even use LaTeX.
const SEGMENT_PATTERN = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g

function renderSegment(segment: string, key: number) {
  const isBlock = segment.startsWith("$$") && segment.endsWith("$$")
  const isInline =
    !isBlock && segment.startsWith("$") && segment.endsWith("$")

  if (!isBlock && !isInline) {
    return <span key={key}>{segment}</span>
  }

  const expression = isBlock ? segment.slice(2, -2) : segment.slice(1, -1)

  try {
    const html = katex.renderToString(expression, {
      throwOnError: false,
      displayMode: isBlock,
    })
    return (
      <span
        key={key}
        className={isBlock ? "block my-1" : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  } catch {
    return <span key={key}>{segment}</span>
  }
}

export function LatexText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const segments = text.split(SEGMENT_PATTERN)
  return (
    <span className={className}>
      {segments.map((segment, i) => renderSegment(segment, i))}
    </span>
  )
}
