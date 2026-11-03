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
        "flex min-w-0 flex-col items-center text-center gap-1.5 sm:gap-2",
        className
      )}
    >
      <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground xs:text-2xl sm:text-3xl lg:text-4xl text-center">
        {title}
      </h1>
      {description && (
        <p className="text-xs sm:text-sm leading-relaxed font-medium text-muted-foreground max-w-md text-center">
          {description}
        </p>
      )}
    </header>
  )
}
