"use client"

import * as React from "react"
import { format, addDays, addHours } from "date-fns"
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  Check,
  RotateCcw,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
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
  const isMobile = useIsMobile()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const date = controlledValue !== undefined ? controlledValue : internalDate

  // Extract display time info
  const currentHours = date ? date.getHours() : 10
  const currentMinutes = date ? date.getMinutes() : 0
  const isPM = currentHours >= 12
  const displayHour = currentHours % 12 || 12

  // Local state for direct numeric editing of hours & minutes
  const [hourInput, setHourInput] = React.useState(String(displayHour))
  const [minuteInput, setMinuteInput] = React.useState(
    String(currentMinutes).padStart(2, "0")
  )

  // Keep input fields in sync when date changes
  React.useEffect(() => {
    setHourInput(String(displayHour))
    setMinuteInput(String(currentMinutes).padStart(2, "0"))
  }, [displayHour, currentMinutes])

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

  function applyTime(h12: number, mins: number, pm: boolean) {
    const base = date ? new Date(date) : new Date()
    let h24 = h12 % 12
    if (pm) {
      h24 += 12
    }
    base.setHours(h24, mins, 0, 0)
    updateDate(base)
  }

  function handleHourChange(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 2)
    setHourInput(clean)
    const num = parseInt(clean, 10)
    if (!isNaN(num) && num >= 1 && num <= 12) {
      applyTime(num, currentMinutes, isPM)
    }
  }

  function handleHourBlur() {
    const num = parseInt(hourInput, 10)
    if (isNaN(num) || num < 1 || num > 12) {
      setHourInput(String(displayHour))
    } else {
      setHourInput(String(num))
      applyTime(num, currentMinutes, isPM)
    }
  }

  function handleMinuteChange(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 2)
    setMinuteInput(clean)
    const num = parseInt(clean, 10)
    if (!isNaN(num) && num >= 0 && num <= 59) {
      applyTime(displayHour, num, isPM)
    }
  }

  function handleMinuteBlur() {
    const num = parseInt(minuteInput, 10)
    if (isNaN(num) || num < 0 || num > 59) {
      setMinuteInput(String(currentMinutes).padStart(2, "0"))
    } else {
      setMinuteInput(String(num).padStart(2, "0"))
      applyTime(displayHour, num, isPM)
    }
  }

  function stepHour(delta: number) {
    let next = displayHour + delta
    if (next > 12) next = 1
    if (next < 1) next = 12
    setHourInput(String(next))
    applyTime(next, currentMinutes, isPM)
  }

  function stepMinute(delta: number) {
    let next = currentMinutes + delta
    if (next >= 60) next = 0
    if (next < 0) next = 59
    setMinuteInput(String(next).padStart(2, "0"))
    applyTime(displayHour, next, isPM)
  }

  function handleSetAmPm(target: "AM" | "PM") {
    const targetIsPM = target === "PM"
    if (targetIsPM !== isPM) {
      applyTime(displayHour, currentMinutes, targetIsPM)
    }
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
    applyTime(displayHour, mins, isPM)
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

  const triggerButton = (
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
      <CalendarIcon
        className={cn(
          "mr-2.5 size-4.5 shrink-0",
          date ? "text-primary" : "text-muted-foreground"
        )}
      />
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
  )

  const quickPresetsSection = (
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
  )

  const calendarSection = (
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
  )

  const timeSection = (
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

      {/* Quick Time Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        {COMMON_TIME_PRESETS.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => handleTimePreset(t.hours, t.minutes)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs",
              date &&
                date.getHours() === t.hours &&
                date.getMinutes() === t.minutes
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs scale-102"
                : "bg-background border-border/70 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Direct Interactive Clock Card (Self-contained, no detached native popups) */}
      <div className="rounded-xl border border-border/70 bg-card p-2.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Hour & Minute Numeric Stepper Inputs */}
          <div className="flex items-center gap-1 bg-background border border-border/80 rounded-lg px-2.5 py-1.5 focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-2xs">
            <Clock className="size-4 text-primary shrink-0 mr-1" />

            {/* Hour Input */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={hourInput}
              onChange={(e) => handleHourChange(e.target.value)}
              onBlur={handleHourBlur}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault()
                  stepHour(1)
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  stepHour(-1)
                }
              }}
              className="w-7 text-center font-mono font-extrabold text-sm sm:text-base text-foreground bg-transparent outline-none focus:text-primary transition-colors select-all"
              aria-label="Hour (1-12)"
              title="Hour (arrow keys or scroll to adjust)"
            />

            <span className="font-extrabold text-muted-foreground select-none pb-0.5">
              :
            </span>

            {/* Minute Input */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={minuteInput}
              onChange={(e) => handleMinuteChange(e.target.value)}
              onBlur={handleMinuteBlur}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault()
                  stepMinute(1)
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  stepMinute(-1)
                }
              }}
              className="w-7 text-center font-mono font-extrabold text-sm sm:text-base text-foreground bg-transparent outline-none focus:text-primary transition-colors select-all"
              aria-label="Minute (0-59)"
              title="Minute (arrow keys or scroll to adjust)"
            />

            {/* Up / Down Stepper Buttons */}
            <div className="flex flex-col ml-1 border-l border-border/60 pl-1 -my-0.5">
              <button
                type="button"
                onClick={() => stepHour(1)}
                className="p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                title="Increment hour"
              >
                <ChevronUp className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => stepHour(-1)}
                className="p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
                title="Decrement hour"
              >
                <ChevronDown className="size-3" />
              </button>
            </div>
          </div>

          {/* AM / PM Segmented Control */}
          <div className="inline-flex rounded-lg border border-border/80 bg-background p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSetAmPm("AM")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer",
                !isPM
                  ? "bg-primary text-primary-foreground shadow-2xs scale-102"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => handleSetAmPm("PM")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer",
                isPM
                  ? "bg-primary text-primary-foreground shadow-2xs scale-102"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              PM
            </button>
          </div>
        </div>

        {/* Quick Minute Granularity Chips */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Minutes:
          </span>
          <div className="flex items-center gap-1.5">
            {MINUTE_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleSetMinute(m)}
                className={cn(
                  "px-2.5 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border",
                  currentMinutes === m
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs scale-105"
                    : "bg-background border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                :{String(m).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const footerSection = (
    <div className="p-3 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-2">
      <div className="text-xs sm:text-sm truncate">
        {date ? (
          <span className="font-bold text-foreground">
            {format(date, "MMM d, yyyy · h:mm a")}
          </span>
        ) : (
          <span className="text-muted-foreground italic font-medium">
            No date selected
          </span>
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
  )

  const isMobileView = mounted && isMobile

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

      {isMobileView ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>{triggerButton}</SheetTrigger>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="p-0 rounded-t-3xl max-h-[90vh] flex flex-col bg-popover border-t border-border/80 shadow-2xl overflow-hidden focus:outline-none"
          >
            {/* Grab Handle & Sheet Title Header */}
            <div className="pt-2.5 pb-2 px-4 border-b border-border/50 bg-muted/20 flex flex-col items-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <div className="flex items-center justify-between w-full">
                <SheetTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarIcon className="size-4 text-primary" />
                  <span>Pick Date & Time</span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Choose a date and time from the picker below
                </SheetDescription>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setOpen(false)}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Body (Calendar + Time selection) */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {quickPresetsSection}
              {calendarSection}
              {timeSection}
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0">{footerSection}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            collisionPadding={12}
            className="w-[370px] max-w-[calc(100vw-2rem)] max-h-[min(650px,calc(100vh-2rem))] overflow-y-auto p-0 rounded-2xl shadow-2xl border border-border/80 bg-popover"
          >
            {quickPresetsSection}
            {calendarSection}
            {timeSection}
            {footerSection}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
