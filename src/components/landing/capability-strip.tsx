import * as React from "react"
import {
  BrainCircuit,
  Flame,
  ScanFace,
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
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white",
  },
  {
    icon: Zap,
    title: "Instant Auto-Grading",
    description: "Real-time scoring & keys",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white",
  },
  {
    icon: Trophy,
    title: "Live Leaderboards",
    description: "Fair rank & XP percentiles",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white",
  },
  {
    icon: BrainCircuit,
    title: "AI Mistake Tutor",
    description: "Instant concept clarity",
    color: "text-sky-500",
    bg: "bg-sky-500/10 border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white",
  },
  {
    icon: Flame,
    title: "Streaks & XP",
    description: "Habit-forming daily study",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white",
  },
  {
    icon: ScanFace,
    title: "Biometric AI Defense",
    description: "Identity verification",
    color: "text-teal-500",
    bg: "bg-teal-500/10 border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white",
  },
] as const

export function CapabilityStrip() {
  return (
    <section className="relative isolate border-y border-border/80 bg-card/60 backdrop-blur-xl py-6 sm:py-8 overflow-hidden">
      {/* Radiant Top & Bottom Edges */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Subtle Ambient Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-24 w-3/4 -translate-x-1/2 -translate-y-1/2 bg-primary/5 blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-3 xl:gap-5">
          {CAPABILITIES.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="group relative flex items-center gap-3 rounded-2xl border border-transparent p-2 sm:p-2.5 xl:p-3 transition-all duration-300 hover:border-border/80 hover:bg-card/90 hover:shadow-xs"
            >
              <div
                className={cn(
                  "flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xs",
                  color,
                  bg
                )}
              >
                <Icon className="size-4.5 sm:size-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {title}
                </p>
                <p className="text-[10.5px] sm:text-[11px] text-muted-foreground leading-tight mt-0.5">
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
