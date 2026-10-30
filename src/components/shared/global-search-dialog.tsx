"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Ticket,
  Receipt,
  ScrollText,
  Settings,
  User as UserIcon,
  PlusCircle,
  Sparkles,
  Command,
  ArrowRight,
  X,
  Loader2,
  BookOpen,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SearchUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface SearchExam {
  id: string
  title: string
  status: string
  totalMarks: number
}

interface SearchCoupon {
  id: string
  code: string
  discountType: string
  discountValue: number
  isActive: boolean
}

interface SearchResults {
  users: SearchUser[]
  exams: SearchExam[]
  coupons: SearchCoupon[]
}

const STATIC_PAGES = [
  {
    title: "Admin Dashboard",
    description: "Platform overview, metrics, and KPI analytics",
    href: "/admin",
    icon: LayoutDashboard,
    badge: "Console",
    keywords: ["home", "stats", "kpi", "overview"],
  },
  {
    title: "User Directory",
    description: "Manage students, teachers, admins, and permissions",
    href: "/admin/users",
    icon: Users,
    badge: "Users",
    keywords: ["students", "teachers", "admins", "accounts", "roles"],
  },
  {
    title: "Teacher Verification",
    description: "Review and approve pending educator applications",
    href: "/admin/teachers",
    icon: GraduationCap,
    badge: "Verification",
    keywords: ["educator", "approval", "pending", "faculty"],
  },
  {
    title: "Subscription Plans",
    description: "Configure pricing tiers, features, and durations",
    href: "/admin/subscriptions",
    icon: CreditCard,
    badge: "Billing",
    keywords: ["pricing", "plans", "stripe", "tiers"],
  },
  {
    title: "Discount Coupons",
    description: "Create and manage promotional discount codes",
    href: "/admin/coupons",
    icon: Ticket,
    badge: "Marketing",
    keywords: ["promo", "voucher", "deal", "discount"],
  },
  {
    title: "Payment Transactions",
    description: "View financial logs, invoices, and payouts",
    href: "/admin/payments",
    icon: Receipt,
    badge: "Finance",
    keywords: ["transactions", "invoices", "revenue", "history"],
  },
  {
    title: "Security Audit Log",
    description: "Trace system operations, privilege changes, and access",
    href: "/admin/audit-log",
    icon: ScrollText,
    badge: "Security",
    keywords: ["audit", "logs", "security", "tracking"],
  },
  {
    title: "System Settings",
    description: "Global platform toggles, email verification & rules",
    href: "/admin/settings",
    icon: Settings,
    badge: "Config",
    keywords: ["config", "maintenance", "toggles"],
  },
  {
    title: "Account Profile",
    description: "Manage personal profile and security credentials",
    href: "/profile",
    icon: UserIcon,
    badge: "Account",
    keywords: ["profile", "me", "password", "settings"],
  },
]

export function openGlobalSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-global-search"))
  }
}

export function GlobalSearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      className={cn(
        "group flex h-11 w-full items-center justify-between rounded-2xl border border-border/40 bg-muted/30 px-4 text-xs sm:text-sm text-muted-foreground shadow-2xs transition-all duration-200 hover:border-primary/30 hover:bg-muted/60 hover:shadow-xs cursor-pointer",
        className
      )}
      title="Search anything (⌘K or Ctrl+K)"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Search className="size-4 text-primary/70 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
        <span className="truncate font-medium text-muted-foreground/80 group-hover:text-foreground">
          Search assessments, users, records...
        </span>
      </div>
      <kbd className="pointer-events-none inline-flex items-center gap-1 rounded-lg border border-border/40 bg-background/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground shadow-2xs transition-colors group-hover:text-foreground">
        <Command className="size-3" />
        <span>K</span>
      </kbd>
    </button>
  )
}

export function GlobalSearchMobileButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      className={cn(
        "flex size-10 items-center justify-center rounded-2xl border-none bg-muted/40 text-muted-foreground shadow-2xs transition-all duration-200 hover:bg-muted/80 hover:text-foreground hover:scale-105 active:scale-95 md:hidden cursor-pointer",
        className
      )}
      aria-label="Open search"
    >
      <Search className="size-4.5" />
    </button>
  )
}

export function GlobalSearchDialog({
  isOpen: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      if (isControlled) {
        setControlledOpen?.(open)
      } else {
        setInternalOpen(open)
      }
    },
    [isControlled, setControlledOpen]
  )

  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<SearchResults>({
    users: [],
    exams: [],
    coupons: [],
  })
  const [filter, setFilter] = React.useState<"all" | "pages" | "users" | "exams" | "coupons">("all")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults({ users: [], exams: [], coupons: [] })
    }
  }, [isOpen])

  // Global Keyboard shortcut listener for ⌘K / Ctrl+K and open-global-search event
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }
    function handleCustomEvent() {
      setIsOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("open-global-search", handleCustomEvent)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("open-global-search", handleCustomEvent)
    }
  }, [isOpen, setIsOpen])


  // Debounced search fetch
  React.useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults({ users: [], exams: [], coupons: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`)
        if (res.ok) {
          const data = (await res.json()) as SearchResults
          setResults(data)
        }
      } catch (err) {
        console.error("Search fetch failed:", err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  function navigateTo(path: string) {
    setIsOpen(false)
    router.push(path)
  }

  // Filter static pages
  const filteredPages = React.useMemo(() => {
    if (!query.trim()) return STATIC_PAGES
    const q = query.toLowerCase()
    return STATIC_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.includes(q))
    )
  }, [query])

  const showPages = filter === "all" || filter === "pages"
  const showUsers = (filter === "all" || filter === "users") && results.users.length > 0
  const showExams = (filter === "all" || filter === "exams") && results.exams.length > 0
  const showCoupons = (filter === "all" || filter === "coupons") && results.coupons.length > 0

  const hasAnyResults =
    (showPages && filteredPages.length > 0) || showUsers || showExams || showCoupons

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        className="fixed top-1/2 left-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-0 overflow-hidden rounded-3xl border-none bg-background/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] ring-1 ring-border/50 duration-200"
      >
        <div className="sr-only">
          <DialogTitle>Global Spotlight Search</DialogTitle>
          <DialogDescription>Quick search for pages, users, exams, and coupons.</DialogDescription>
        </div>

        {/* Top Search Input Bar */}
        <div className="relative flex items-center border-b border-border/20 px-4 py-3 sm:px-6">
          <Search className="size-5 shrink-0 text-primary animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, users, exams, coupons... (Type to find anything)"
            className="flex-1 bg-transparent px-3 text-base sm:text-lg font-medium text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {loading && (
            <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground mr-2" />
          )}
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex size-7 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-muted/60 px-2 py-1 text-[11px] font-mono font-semibold text-muted-foreground shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b border-border/15 bg-muted/20 text-xs overflow-x-auto">
          {(
            [
              { id: "all", label: "All" },
              { id: "pages", label: "Navigation" },
              { id: "users", label: `Users (${results.users.length})` },
              { id: "exams", label: `Exams (${results.exams.length})` },
              { id: "coupons", label: `Coupons (${results.coupons.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-xl px-3 py-1 font-semibold transition-all cursor-pointer whitespace-nowrap",
                filter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Section: Dynamic Users Results */}
          {showUsers && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="size-3.5 text-primary" />
                <span>Users ({results.users.length})</span>
              </div>
              {results.users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => navigateTo(`/admin/users?q=${encodeURIComponent(u.email)}`)}
                  className="w-full group flex items-center justify-between gap-3 rounded-2xl p-3 text-left transition-all hover:bg-muted/70 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">{u.name}</span>
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            u.isActive ? "bg-emerald-500" : "bg-destructive"
                          )}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      {u.role}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section: Dynamic Exams Results */}
          {showExams && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <BookOpen className="size-3.5 text-primary" />
                <span>Exams ({results.exams.length})</span>
              </div>
              {results.exams.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => navigateTo("/admin")}
                  className="w-full group flex items-center justify-between gap-3 rounded-2xl p-3 text-left transition-all hover:bg-muted/70 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <BookOpen className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-foreground truncate block">{ex.title}</span>
                      <p className="text-xs text-muted-foreground">Total Marks: {ex.totalMarks}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      {ex.status}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section: Dynamic Coupons Results */}
          {showCoupons && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Ticket className="size-3.5 text-primary" />
                <span>Coupons ({results.coupons.length})</span>
              </div>
              {results.coupons.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigateTo("/admin/coupons")}
                  className="w-full group flex items-center justify-between gap-3 rounded-2xl p-3 text-left transition-all hover:bg-muted/70 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs">
                      %
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono font-bold text-foreground tracking-wide block">{c.code}</span>
                      <p className="text-xs text-muted-foreground">
                        {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={c.isActive ? "default" : "secondary"} className="text-[10px]">
                      {c.isActive ? "Active" : "Disabled"}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section: Navigation / Pages */}
          {showPages && filteredPages.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Console Navigation</span>
              </div>
              {filteredPages.map((page) => {
                const PageIcon = page.icon
                return (
                  <button
                    key={page.href}
                    type="button"
                    onClick={() => navigateTo(page.href)}
                    className="w-full group flex items-center justify-between gap-3 rounded-2xl p-3 text-left transition-all hover:bg-muted/70 active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                        <PageIcon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground text-sm sm:text-base block">
                          {page.title}
                        </span>
                        <p className="text-xs text-muted-foreground truncate">{page.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {page.badge}
                      </Badge>
                      <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!hasAnyResults && (
            <div className="py-12 text-center space-y-2">
              <Search className="size-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No matches found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn&apos;t find anything matching &quot;{query}&quot;. Try searching for users, plans, coupons, or page titles.
              </p>
            </div>
          )}
        </div>

        {/* World-Class Keyboard Navigation Footer */}
        <div className="flex items-center justify-between border-t border-border/15 bg-muted/30 px-4 py-2.5 sm:px-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">↑</kbd>
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">ESC</kbd>
            <span>close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
