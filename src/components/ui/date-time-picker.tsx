"use client"

import * as React from "react"
import { format, addDays, addWeeks, addHours } from "date-fns"
import { Calendar as CalendarIcon, Clock, X, Check, RotateCcw, Sparkles } from "lucide-react"
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

  const date = controlledValue !== undefined ? controlledValue : internalDate

  // Format hours:minutes (24h) for HTML time input
  const timeString = React.useMemo(() => {
    if (!date) return "10:00"
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
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
      // Default to 10:00 AM if no time was previously selected
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
              "w-full justify-start text-left font-normal h-11 sm:h-12 rounded-xl border-border/80 bg-background shadow-2xs hover:bg-muted/40 px-3.5 text-sm transition-all",
              !date && "text-muted-foreground",
              date && "font-semibold text-foreground border-primary/40 bg-primary/5",
              className
            )}
          >
            <CalendarIcon className={cn("mr-2.5 size-4 shrink-0", date ? "text-primary" : "text-muted-foreground")} />
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
                <X className="size-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 rounded-2xl shadow-xl border-border/80 bg-popover overflow-hidden"
          align="start"
        >
          {/* Top Quick Date Presets Bar */}
          <div className="p-2.5 border-b border-border/50 bg-muted/20 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
              Quick:
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handlePresetDay(0)}
              className="rounded-lg text-xs font-semibold h-7 px-2.5 border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handlePresetDay(1)}
              className="rounded-lg text-xs font-semibold h-7 px-2.5 border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer"
            >
              Tomorrow
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handlePresetDay(3)}
              className="rounded-lg text-xs font-semibold h-7 px-2.5 border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer"
            >
              In 3 Days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handlePresetDay(7)}
              className="rounded-lg text-xs font-semibold h-7 px-2.5 border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer"
            >
              Next Week
            </Button>
          </div>

          {/* Interactive Calendar */}
          <div className="p-1">
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

          {/* Time Picker & Quick Presets Section */}
          <div className="p-3 border-t border-border/50 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>Select Time</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleSetNow}
                  className="h-6 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Now
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleAddHour}
                  className="h-6 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10 cursor-pointer"
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
                    "px-2 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer",
                    date && date.getHours() === t.hours && date.getMinutes() === t.minutes
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-background border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Manual HTML Time Input */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-muted-foreground font-medium">Custom:</span>
              <Input
                type="time"
                value={timeString}
                onChange={handleTimeInputChange}
                disabled={disabled}
                className="h-8 w-28 rounded-lg text-xs bg-background border-border/80 font-bold px-2 shadow-2xs"
              />
            </div>
          </div>

          {/* Bottom Confirmation & Status Footer */}
          <div className="p-3 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-2">
            <div className="text-xs truncate">
              {date ? (
                <span className="font-semibold text-foreground">
                  {format(date, "MMM d, yyyy · h:mm a")}
                </span>
              ) : (
                <span className="text-muted-foreground italic">No date selected</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {date && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClear()}
                  className="h-8 px-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  Clear
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 px-3.5 text-xs font-bold rounded-lg cursor-pointer"
              >
                <Check className="size-3.5 mr-1" />
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
