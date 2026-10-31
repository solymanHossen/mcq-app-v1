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
  Compass,
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
        "group flex h-9.5 sm:h-10 w-full items-center justify-between rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/60 hover:border-border/90 px-3.5 text-xs sm:text-sm text-muted-foreground shadow-2xs transition-all duration-150 cursor-pointer",
        className
      )}
      title="Search anything (⌘K or Ctrl+K)"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Search className="size-4 text-muted-foreground/70 group-hover:text-foreground shrink-0 transition-colors" />
        <span className="truncate font-normal text-muted-foreground/70 group-hover:text-foreground text-xs sm:text-sm">
          Search assessments, users, records...
        </span>
      </div>
      <kbd className="pointer-events-none inline-flex items-center gap-0.5 rounded-md border border-border/70 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground/80 shadow-2xs transition-colors group-hover:text-foreground">
        <Command className="size-2.5" />
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
        "flex size-8.5 sm:size-9 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground shadow-2xs transition-all duration-150 hover:bg-muted/70 hover:text-foreground md:hidden cursor-pointer",
        className
      )}
      aria-label="Open search"
    >
      <Search className="size-4" />
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
        className="w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-2xl duration-200 gap-0"
      >
        <div className="sr-only">
          <DialogTitle>Global Spotlight Search</DialogTitle>
          <DialogDescription>Quick search for pages, users, exams, and coupons.</DialogDescription>
        </div>

        {/* Top Search Input Bar */}
        <div className="relative flex items-center border-b border-border/60 bg-muted/20 px-4 sm:px-5 py-3 sm:py-3.5">
          <Search className="size-4.5 sm:size-5 shrink-0 text-muted-foreground/80 transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, users, exams, coupons... (Type to find anything)"
            className="flex-1 bg-transparent px-3 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {loading && (
            <Loader2 className="size-4.5 shrink-0 animate-spin text-muted-foreground mr-2" />
          )}
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Clear query"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/90 px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 border-b border-border/60 bg-muted/10 text-xs overflow-x-auto">
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
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                filter === tab.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Results Area with comfortable bottom padding & sleek scrollbar */}
        <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto p-3 sm:p-4 pb-5 sm:pb-6 space-y-3.5 [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
          {/* Section: Dynamic Users Results */}
          {showUsers && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                <Users className="size-3.5 text-primary" />
                <span>Users ({results.users.length})</span>
              </div>
              {results.users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => navigateTo(`/admin/users?q=${encodeURIComponent(u.email)}`)}
                  className="w-full group flex items-center justify-between gap-3 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-150 border border-transparent hover:border-border/60 hover:bg-muted/50 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-xs font-bold text-primary shadow-2xs">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-sm text-foreground truncate">{u.name}</span>
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
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold border-border/70">
                      {u.role}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section: Dynamic Exams Results */}
          {showExams && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                <BookOpen className="size-3.5 text-primary" />
                <span>Exams ({results.exams.length})</span>
              </div>
              {results.exams.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => navigateTo("/admin")}
                  className="w-full group flex items-center justify-between gap-3 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-150 border border-transparent hover:border-border/60 hover:bg-muted/50 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs">
                      <BookOpen className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-heading font-semibold text-sm text-foreground truncate block">{ex.title}</span>
                      <p className="text-xs text-muted-foreground">Total Marks: {ex.totalMarks}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] font-semibold border-border/70">
                      {ex.status}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section: Dynamic Coupons Results */}
          {showCoupons && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                <Ticket className="size-3.5 text-primary" />
                <span>Coupons ({results.coupons.length})</span>
              </div>
              {results.coupons.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigateTo("/admin/coupons")}
                  className="w-full group flex items-center justify-between gap-3 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-150 border border-transparent hover:border-border/60 hover:bg-muted/50 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs shadow-2xs">
                      %
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono font-bold text-sm text-foreground tracking-wide block">{c.code}</span>
                      <p className="text-xs text-muted-foreground">
                        {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={c.isActive ? "secondary" : "outline"} className="text-[10px] font-semibold border-border/70">
                      {c.isActive ? "Active" : "Disabled"}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Section: Navigation / Pages */}
          {showPages && filteredPages.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                <Compass className="size-3.5 text-primary" />
                <span>Console Navigation</span>
              </div>
              {filteredPages.map((page) => {
                const PageIcon = page.icon
                return (
                  <button
                    key={page.href}
                    type="button"
                    onClick={() => navigateTo(page.href)}
                    className="w-full group flex items-center justify-between gap-3 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-150 border border-transparent hover:border-border/60 hover:bg-muted/50 active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200 shadow-2xs">
                        <PageIcon className="size-4.5 sm:size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-heading font-semibold text-sm sm:text-[15px] text-foreground tracking-tight block truncate">
                          {page.title}
                        </span>
                        <p className="text-xs text-muted-foreground truncate">{page.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="rounded-md border border-border/50 bg-muted/50 text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                        {page.badge}
                      </Badge>
                      <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!hasAnyResults && (
            <div className="py-12 sm:py-16 text-center space-y-2">
              <Search className="size-9 mx-auto text-muted-foreground/40" />
              <p className="font-heading text-sm font-semibold text-foreground">No matches found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn&apos;t find anything matching &quot;{query}&quot;. Try searching for users, plans, coupons, or page titles.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
