import Image from "next/image"
import { LatexText } from "@/components/shared/latex-text"
import { CodeSnippet } from "@/components/shared/code-snippet"
import { cn } from "@/lib/utils"

export type QuestionContentData = {
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: "A" | "B" | "C" | "D"
  explanation?: string | null
  imageUrl?: string | null
  codeSnippet?: string | null
  codeLanguage?: string | null
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const

export function QuestionContent({ data }: { data: QuestionContentData }) {
  const options = {
    A: data.optionA,
    B: data.optionB,
    C: data.optionC,
    D: data.optionD,
  }

  return (
    <div className="space-y-4">
      <LatexText text={data.questionText} className="font-medium" />

      {data.imageUrl && (
        <Image
          src={data.imageUrl}
          alt="Question diagram"
          width={480}
          height={320}
          unoptimized
          className="max-h-80 w-auto rounded-md border object-contain"
        />
      )}

      {data.codeSnippet && (
        <CodeSnippet
          code={data.codeSnippet}
          language={data.codeLanguage ?? undefined}
        />
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {OPTION_KEYS.map((key) => (
          <div
            key={key}
            className={cn(
              "flex items-start gap-2 rounded-md border p-2 text-sm",
              key === data.correctOption &&
                "border-primary bg-primary/5 font-medium"
            )}
          >
            <span className="text-muted-foreground">{key}.</span>
            <LatexText text={options[key]} />
          </div>
        ))}
      </div>

      {data.explanation && (
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Explanation: </span>
          <LatexText text={data.explanation} />
        </div>
      )}
    </div>
  )
}
