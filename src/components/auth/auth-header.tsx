import { cn } from "@/lib/utils"

interface AuthHeaderProps {
  title: string
  description?: string
  className?: string
}

export function AuthHeader({ title, description, className }: AuthHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-w-0 flex-col gap-1.5 border-b border-border/60 pb-2.5 sm:gap-2 sm:pb-4",
        className
      )}
    >
      <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground xs:text-2xl sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-xs leading-relaxed font-medium wrap-anywhere text-muted-foreground sm:text-sm">
          {description}
        </p>
      )}
    </header>
  )
}
