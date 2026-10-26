import * as React from "react"
import {
  BrainCircuit,
  ShieldCheck,
  Trophy,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: "Timed & Proctored",
    description: "Tab-switch & focus defense",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-white",
  },
  {
    icon: Zap,
    title: "Instant Auto-Grading",
    description: "Real-time scoring & keys",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:bg-amber-500 dark:group-hover:text-white",
  },
  {
    icon: Trophy,
    title: "Live Leaderboards",
    description: "Fair rank & XP percentiles",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:bg-indigo-500 dark:group-hover:text-white",
  },
  {
    icon: BrainCircuit,
    title: "AI Mistake Tutor",
    description: "Instant concept clarity",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white dark:group-hover:bg-sky-500 dark:group-hover:text-white",
  },
] as const

export function CapabilityStrip() {
  return (
    <section className="relative isolate py-6 sm:py-8 lg:py-10 overflow-hidden">
      {/* Subtle Ambient Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-28 w-3/4 -translate-x-1/2 -translate-y-1/2 bg-primary/5 blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:gap-6">
          {CAPABILITIES.map(({ icon: Icon, title, description, bg }) => (
            <div
              key={title}
              className="group relative flex items-center gap-4 rounded-2xl bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1 cursor-default"
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md",
                  bg
                )}
              >
                <Icon className="size-6 transition-transform duration-300 ease-out group-hover:scale-110" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-[17px] font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug tracking-tight">
                  {title}
                </h3>
                <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed mt-1">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
