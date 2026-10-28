"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface DebouncedSearchInputProps {
  /** The URL query parameter key to synchronize with (default: "q") */
  paramKey?: string
  /** Static default value if not using searchParams */
  defaultValue?: string
  /** Placeholder text for the input */
  placeholder?: string
  /** Debounce delay in milliseconds (default: 300ms) */
  delayMs?: number
  /** Outer container className */
  className?: string
  /** Inner input element className */
  inputClassName?: string
  /** Whether to sync the search query with Next.js router URL searchParams (default: true) */
  syncUrl?: boolean
  /** Callback invoked whenever debounced query value updates */
  onSearch?: (value: string) => void
  /** Show the clear (X) button when input has value (default: true) */
  showClear?: boolean
  /** Auto focus input on mount */
  autoFocus?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Input size variation */
  size?: "sm" | "default" | "lg"
}

export function DebouncedSearchInput({
  paramKey = "q",
  defaultValue,
  placeholder = "Search...",
  delayMs = 300,
  className,
  inputClassName,
  syncUrl = true,
  onSearch,
  showClear = true,
  autoFocus = false,
  disabled = false,
  size = "default",
}: DebouncedSearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initial query value from URL or defaultValue prop
  const getUrlValue = React.useCallback(() => {
    return syncUrl ? (searchParams?.get(paramKey) ?? "") : (defaultValue ?? "")
  }, [syncUrl, searchParams, paramKey, defaultValue])

  const [value, setValue] = React.useState(getUrlValue)
  const [isPending, startTransition] = React.useTransition()
  const [isTyping, setIsTyping] = React.useState(false)

  // Keep state in sync if URL query parameter changes externally (e.g., Back/Forward buttons, reset)
  React.useEffect(() => {
    if (syncUrl) {
      const urlValue = searchParams?.get(paramKey) ?? ""
      setValue((prev) => (prev !== urlValue ? urlValue : prev))
    }
  }, [searchParams, paramKey, syncUrl])

  // Function to commit the query update
  const commitQuery = React.useCallback(
    (term: string) => {
      setIsTyping(false)
      onSearch?.(term)

      if (syncUrl) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams?.toString() ?? "")
          const trimmed = term.trim()

          if (trimmed) {
            params.set(paramKey, trimmed)
          } else {
            params.delete(paramKey)
          }

          // Reset pagination when search query changes
          params.delete("page")

          const qs = params.toString()
          const nextUrl = qs ? `${pathname}?${qs}` : pathname
          router.replace(nextUrl, { scroll: false })
        })
      }
    },
    [onSearch, syncUrl, searchParams, paramKey, pathname, router]
  )

  // Debounced effect for input typing
  React.useEffect(() => {
    const currentUrlValue = getUrlValue()

    // Skip debounce if current input equals current committed URL value
    if (value === currentUrlValue) {
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      commitQuery(value)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [value, delayMs, commitQuery, getUrlValue])

  function handleClear() {
    setValue("")
    commitQuery("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault()
      handleClear()
      e.currentTarget.blur()
    } else if (e.key === "Enter") {
      e.preventDefault()
      // Immediately commit query without waiting for debounce timer
      commitQuery(value)
    }
  }

  const isBusy = isTyping || isPending

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors",
          size === "sm" ? "size-3.5" : "size-4",
          isBusy ? "text-primary animate-pulse" : "text-muted-foreground"
        )}
      />

      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "w-full rounded-2xl border border-border/70 bg-card pl-10 pr-10 text-xs sm:text-sm shadow-xs transition-all duration-200 placeholder:text-muted-foreground/75 focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/40",
          size === "sm" && "h-9 rounded-xl pl-9 pr-9 text-xs",
          size === "default" && "h-11",
          size === "lg" && "h-12 text-base pl-11 pr-11",
          inputClassName
        )}
      />

      {/* Right Indicator: Active Spinner or Quick Clear button */}
      <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
        {isBusy ? (
          <Loader2 className="size-4 animate-spin text-primary/70 pointer-events-none" />
        ) : showClear && value ? (
          <button
            type="button"
            onClick={handleClear}
            className="flex size-5 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Clear search (Esc)"
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
