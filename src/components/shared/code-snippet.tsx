// Monospace rendering only — no syntax highlighting yet (see remaining work).
export function CodeSnippet({
  code,
  language,
}: {
  code: string
  language?: string
}) {
  return (
    <div className="overflow-hidden rounded-md border bg-muted">
      {language && (
        <div className="border-b bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
          {language}
        </div>
      )}
      <pre className="overflow-x-auto p-3 font-mono text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}
