"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL = "__all__"

const filterTriggerClassName =
  "w-full min-w-0 shrink-0 rounded-xl border-border/70 bg-card text-sm font-semibold shadow-2xs transition-colors hover:bg-muted/40 data-[size=default]:h-11 data-[size=default]:sm:h-12 sm:w-44 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left [&_[data-slot=select-value]]:whitespace-nowrap"

export function QuestionFilters({
  subjects,
  topics,
}: {
  subjects: string[]
  topics: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <DebouncedSearchInput
        paramKey="search"
        placeholder="Search question text…"
        className="w-full min-w-0 sm:w-64 sm:shrink-0"
        inputClassName="h-11 rounded-xl border-border/70 bg-card text-base shadow-2xs sm:h-12 sm:text-sm"
      />

      <Select
        value={searchParams.get("subject") ?? ALL}
        onValueChange={(v) => setParam("subject", v)}
      >
        <SelectTrigger aria-label="Subject" className={filterTriggerClassName}>
          <SelectValue placeholder="All subjects" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="rounded-xl border-border/70 shadow-xl bg-popover z-50 p-1">
          <SelectGroup>
            <SelectItem value={ALL} className="rounded-lg text-xs sm:text-sm font-medium">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s} className="rounded-lg text-xs sm:text-sm font-medium">
                {s}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("topic") ?? ALL}
        onValueChange={(v) => setParam("topic", v)}
      >
        <SelectTrigger aria-label="Topic" className={filterTriggerClassName}>
          <SelectValue placeholder="All topics" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="rounded-xl border-border/70 shadow-xl bg-popover z-50 p-1">
          <SelectGroup>
            <SelectItem value={ALL} className="rounded-lg text-xs sm:text-sm font-medium">All topics</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t} value={t} className="rounded-lg text-xs sm:text-sm font-medium">
                {t}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("difficulty") ?? ALL}
        onValueChange={(v) => setParam("difficulty", v)}
      >
        <SelectTrigger aria-label="Difficulty" className={filterTriggerClassName}>
          <SelectValue placeholder="Any difficulty" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="rounded-xl border-border/70 shadow-xl bg-popover z-50 p-1">
          <SelectGroup>
            <SelectItem value={ALL} className="rounded-lg text-xs sm:text-sm font-medium">Any difficulty</SelectItem>
            <SelectItem value="EASY" className="rounded-lg text-xs sm:text-sm font-medium">Easy</SelectItem>
            <SelectItem value="MEDIUM" className="rounded-lg text-xs sm:text-sm font-medium">Medium</SelectItem>
            <SelectItem value="HARD" className="rounded-lg text-xs sm:text-sm font-medium">Hard</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? ALL}
        onValueChange={(v) => setParam("status", v)}
      >
        <SelectTrigger aria-label="Status" className={filterTriggerClassName}>
          <SelectValue placeholder="Any status" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} className="rounded-xl border-border/70 shadow-xl bg-popover z-50 p-1">
          <SelectGroup>
            <SelectItem value={ALL} className="rounded-lg text-xs sm:text-sm font-medium">Any status</SelectItem>
            <SelectItem value="DRAFT" className="rounded-lg text-xs sm:text-sm font-medium">Draft</SelectItem>
            <SelectItem value="ACTIVE" className="rounded-lg text-xs sm:text-sm font-medium">Active</SelectItem>
            <SelectItem value="ARCHIVED" className="rounded-lg text-xs sm:text-sm font-medium">Archived</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
