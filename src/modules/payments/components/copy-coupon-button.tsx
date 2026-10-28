"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Copy, Check } from "lucide-react"

export function CopyCouponButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success(`Coupon code "${code}" copied to clipboard`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy coupon code")
    }
  }

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      title="Click to copy coupon code"
      className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-xs sm:text-sm font-bold tracking-wider text-foreground hover:bg-muted/70 transition-all cursor-pointer border border-transparent hover:border-border/60"
    >
      <span>{code}</span>
      {copied ? (
        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  )
}
