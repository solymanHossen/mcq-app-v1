import { IMPORT_TEMPLATE_HEADER } from "@/modules/question-bank/validators"
import { ImportForm } from "@/modules/question-bank/components/import-form"
import { CodeSnippet } from "@/components/shared/code-snippet"

export default function ImportQuestionsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Bulk import questions</h1>
      <p className="text-sm text-muted-foreground">
        Upload a CSV with one question per row. Each row is validated the same
        way the single-question form is; invalid rows and exact duplicates are
        skipped and reported, everything else is imported.
      </p>
      <div className="space-y-1">
        <p className="text-sm font-medium">Expected columns</p>
        <CodeSnippet code={IMPORT_TEMPLATE_HEADER} />
      </div>
      <ImportForm />
    </div>
  )
}
