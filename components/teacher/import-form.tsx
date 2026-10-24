"use client"

import { useActionState } from "react"
import { bulkImportQuestionsAction } from "@/actions/question.actions"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function ImportForm() {
  const [state, formAction, isPending] = useActionState(
    bulkImportQuestionsAction,
    undefined
  )

  return (
    <div className="max-w-2xl space-y-6">
      <form action={formAction} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="file">CSV file</FieldLabel>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-secondary file:px-3 file:py-1.5 file:text-sm"
          />
        </Field>
        {state && "error" in state && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          Import
        </Button>
      </form>

      {state && "totalRows" in state && (
        <Alert>
          <AlertTitle>Import summary</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{state.totalRows} rows read</Badge>
              <Badge>{state.imported} imported</Badge>
              <Badge variant="outline">
                {state.skippedDuplicates} duplicates skipped
              </Badge>
              {state.invalidRows.length > 0 && (
                <Badge variant="destructive">
                  {state.invalidRows.length} invalid
                </Badge>
              )}
            </div>
            {state.invalidRows.length > 0 && (
              <ul className="max-h-64 space-y-1 overflow-y-auto text-xs">
                {state.invalidRows.map((r) => (
                  <li key={r.row}>
                    Row {r.row}: {r.errors.join("; ")}
                  </li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
