import * as React from "react"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface AuthHeaderProps {
  title: string
  description?: string
  className?: string
}

export function AuthHeader({ title, description, className }: AuthHeaderProps) {
  return (
    <CardHeader className={`p-0 pb-6 text-center ${className ?? ""}`}>
      <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </CardTitle>
      {description && (
        <CardDescription className="text-base text-muted-foreground mt-2">
          {description}
        </CardDescription>
      )}
    </CardHeader>
  )
}
