"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { exportSubscribersAction } from "@/modules/newsletter/actions"

export function ExportSubscribersButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await exportSubscribersAction()
      if (!res.success || !res.data) {
        toast.error(res.error || "Failed to export subscribers.")
        return
      }

      if (res.data.length === 0) {
        toast.info("No subscribers available to export.")
        return
      }

      // Convert to CSV
      const headers = ["Email", "Status", "Source", "Subscribed At"]
      const rows = res.data.map((item) => [
        `"${item.email.replace(/"/g, '""')}"`,
        item.status,
        item.source || "footer",
        new Date(item.createdAt).toISOString(),
      ])

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `examhub-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${res.data.length} subscriber(s) to CSV!`)
    } catch {
      toast.error("Failed to export subscribers.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isExporting}
      onClick={handleExport}
      className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-foreground shadow-2xs transition-all active:scale-95 gap-1.5 sm:gap-2 cursor-pointer shrink-0"
    >
      {isExporting ? <Spinner className="size-3.5" /> : <Download className="size-3.5" />}
      <span>Export CSV</span>
    </Button>
  )
}
