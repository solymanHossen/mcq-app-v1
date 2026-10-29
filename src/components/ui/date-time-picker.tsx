"use client"

import * as React from "react"
import { format, addDays, addHours } from "date-fns"
import { Calendar as CalendarIcon, Clock, X, Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DateTimePickerProps {
  id?: string
  name?: string
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

const COMMON_TIME_PRESETS = [
  { label: "09:00 AM", hours: 9, minutes: 0 },
  { label: "11:00 AM", hours: 11, minutes: 0 },
  { label: "02:00 PM", hours: 14, minutes: 0 },
  { label: "04:00 PM", hours: 16, minutes: 0 },
  { label: "06:00 PM", hours: 18, minutes: 0 },
]

const MINUTE_PRESETS = [0, 15, 30, 45]

export function DateTimePicker({
  id,
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Pick date & time",
  disabled = false,
  className,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultValue
  )
  const [open, setOpen] = React.useState(false)
  const timeInputRef = React.useRef<HTMLInputElement>(null)

  const date = controlledValue !== undefined ? controlledValue : internalDate

  // Format hours:minutes (24h) for HTML time input
  const timeString = React.useMemo(() => {
    if (!date) return "10:00"
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }, [date])

  // Extract display time info
  const currentHours = date ? date.getHours() : 10
  const currentMinutes = date ? date.getMinutes() : 0
  const isPM = currentHours >= 12
  const displayHour = currentHours % 12 || 12
  const formattedTimeString = React.useMemo(() => {
    if (!date) return "10:00 AM"
    return format(date, "h:mm a")
  }, [date])

  function updateDate(newDate: Date | undefined) {
    if (controlledValue === undefined) {
      setInternalDate(newDate)
    }
    onChange?.(newDate)
  }

  function handleDateSelect(selectedDay: Date | undefined) {
    if (!selectedDay) {
      updateDate(undefined)
      return
    }

    const next = new Date(selectedDay)
    if (date) {
      next.setHours(date.getHours(), date.getMinutes(), 0, 0)
    } else {
      next.setHours(10, 0, 0, 0)
    }

    updateDate(next)
  }

  function handlePresetDay(daysToAdd: number) {
    const base = new Date()
    const target = addDays(base, daysToAdd)
    if (date) {
      target.setHours(date.getHours(), date.getMinutes(), 0, 0)
    } else {
      target.setHours(10, 0, 0, 0)
    }
    updateDate(target)
  }

  function handleTimePreset(hours: number, minutes: number) {
    const base = date ? new Date(date) : new Date()
    base.setHours(hours, minutes, 0, 0)
    updateDate(base)
  }

  function handleAddHour() {
    const base = date ? new Date(date) : new Date()
    const next = addHours(base, 1)
    updateDate(next)
  }

  function handleSetMinute(mins: number) {
    const base = date ? new Date(date) : new Date()
    base.setMinutes(mins, 0, 0)
    updateDate(base)
  }

  function handleToggleAmPm() {
    const base = date ? new Date(date) : new Date()
    const currentH = base.getHours()
    if (currentH >= 12) {
      base.setHours(currentH - 12)
    } else {
      base.setHours(currentH + 12)
    }
    updateDate(base)
  }

  function handleTimeInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (!val) return

    const [hoursStr, minutesStr] = val.split(":")
    const hours = parseInt(hoursStr, 10)
    const minutes = parseInt(minutesStr, 10)

    const base = date ? new Date(date) : new Date()
    base.setHours(hours, minutes, 0, 0)
    updateDate(base)
  }

  function handleOpenNativeTimePicker() {
    const input = timeInputRef.current
    if (!input) return
    try {
      if ("showPicker" in input && typeof (input as any).showPicker === "function") {
        (input as any).showPicker()
      } else {
        input.focus()
      }
    } catch {
      input.focus()
    }
  }

  function handleClear(e?: React.MouseEvent) {
    e?.stopPropagation()
    updateDate(undefined)
  }

  function handleSetNow() {
    const now = new Date()
    updateDate(now)
  }

  // Value formatted for HTML form submission: YYYY-MM-DDTHH:mm (local timezone)
  const hiddenValue = date
    ? new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16)
    : ""

  return (
    <div className={cn("relative w-full", className)}>
      {name && (
        <input
          type="hidden"
          id={id}
          name={name}
          value={hiddenValue}
          disabled={disabled}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-11 sm:h-12 rounded-xl border-border/80 bg-background shadow-2xs hover:bg-muted/40 px-3.5 text-sm sm:text-base transition-all cursor-pointer",
              !date && "text-muted-foreground",
              date && "font-semibold text-foreground border-primary/40 bg-primary/5",
              className
            )}
          >
            <CalendarIcon className={cn("mr-2.5 size-4.5 shrink-0", date ? "text-primary" : "text-muted-foreground")} />
            <span className="flex-1 truncate">
              {date ? format(date, "EEE, MMM d, yyyy · h:mm a") : placeholder}
            </span>
            {date && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)
                }
                className="ml-1 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear date & time"
              >
                <X className="size-4" />
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[calc(100vw-2rem)] sm:w-[370px] max-w-[370px] p-0 rounded-2xl shadow-2xl border border-border/80 bg-popover overflow-hidden"
          align="start"
        >

          {/* Top Quick Date Presets Bar (No 'QUICK:' text, 4 clean pills) */}
          <div className="p-2.5 sm:p-3 border-b border-border/50 bg-muted/20 grid grid-cols-4 gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePresetDay(0)}
              className="w-full rounded-xl text-xs sm:text-sm font-semibold h-8 sm:h-8.5 border-border/70 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer transition-all active:scale-95 px-1 shadow-2xs"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePresetDay(1)}
              className="w-full rounded-xl text-xs sm:text-sm font-semibold h-8 sm:h-8.5 border-border/70 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer transition-all active:scale-95 px-1 shadow-2xs"
            >
              Tomorrow
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePresetDay(3)}
              className="w-full rounded-xl text-xs sm:text-sm font-semibold h-8 sm:h-8.5 border-border/70 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer transition-all active:scale-95 px-1 shadow-2xs"
            >
              In 3 Days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePresetDay(7)}
              className="w-full rounded-xl text-xs sm:text-sm font-semibold h-8 sm:h-8.5 border-border/70 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer transition-all active:scale-95 px-1 shadow-2xs"
            >
              Next Week
            </Button>
          </div>

          {/* Interactive Full-Width Calendar Grid */}
          <div className="w-full">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(d) =>
                (minDate ? d < minDate : false) || (maxDate ? d > maxDate : false)
              }
              autoFocus
            />
          </div>

          {/* Time Picker & Interactive Clickable Clock Section */}
          <div className="p-3 sm:p-3.5 border-t border-border/50 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground">
                <Clock className="size-4 text-primary" />
                <span>Time Selection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleSetNow}
                  className="h-6.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Now
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleAddHour}
                  className="h-6.5 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer rounded-lg"
                >
                  +1 Hour
                </Button>
              </div>
            </div>

            {/* Quick Time Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {COMMON_TIME_PRESETS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => handleTimePreset(t.hours, t.minutes)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs",
                    date && date.getHours() === t.hours && date.getMinutes() === t.minutes
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs scale-102"
                      : "bg-background border-border/70 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Custom Interactive Clock Card (100% Clickable & User-Friendly) */}
            <div className="rounded-xl border border-border/70 bg-card p-2.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                {/* Clickable Clock Pill that triggers picker or displays time */}
                <button
                  type="button"
                  onClick={handleOpenNativeTimePicker}
                  className="group flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
                  title="Click to change time"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-extrabold text-foreground tracking-wide font-mono">
                      {formattedTimeString}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary/80 group-hover:text-primary">
                    Edit ▾
                  </span>
                </button>

                {/* AM / PM Quick Toggle */}
                <button
                  type="button"
                  onClick={handleToggleAmPm}
                  className="h-9 px-3 rounded-lg border border-border/80 bg-background hover:bg-muted text-xs font-extrabold text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Switch AM / PM"
                >
                  {isPM ? "PM" : "AM"}
                </button>

                {/* Hidden Native Time Input for full browser integration */}
                <input
                  ref={timeInputRef}
                  type="time"
                  value={timeString}
                  onChange={handleTimeInputChange}
                  disabled={disabled}
                  className="sr-only"
                  aria-label="Custom time"
                />
              </div>

              {/* Quick Minute Granularity Chips */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Minutes:
                </span>
                <div className="flex items-center gap-1">
                  {MINUTE_PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSetMinute(m)}
                      className={cn(
                        "size-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                        currentMinutes === m
                          ? "bg-primary text-primary-foreground shadow-2xs scale-105"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      :{String(m).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Confirmation & Status Footer */}
          <div className="p-3 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-2">
            <div className="text-xs sm:text-sm truncate">
              {date ? (
                <span className="font-bold text-foreground">
                  {format(date, "MMM d, yyyy · h:mm a")}
                </span>
              ) : (
                <span className="text-muted-foreground italic font-medium">No date selected</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {date && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClear()}
                  className="h-8.5 px-3 text-xs sm:text-sm font-semibold text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                >
                  Clear
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8.5 px-4 text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-xs active:scale-98"
              >
                <Check className="size-4 mr-1.5" />
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
