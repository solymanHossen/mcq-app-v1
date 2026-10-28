"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, X, Check } from "lucide-react"
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

  // Hours (0-23) & Minutes (0-59) string for the time input
  const timeString = React.useMemo(() => {
    if (!date) return "12:00"
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }, [date])

  function handleDateSelect(selectedDay: Date | undefined) {
    if (!selectedDay) {
      if (controlledValue === undefined) setInternalDate(undefined)
      onChange?.(undefined)
      return
    }

    const newDate = new Date(selectedDay)
    if (date) {
      newDate.setHours(date.getHours())
      newDate.setMinutes(date.getMinutes())
      newDate.setSeconds(0)
    } else {
      // Default to 12:00 PM if no time was previously selected
      newDate.setHours(12, 0, 0, 0)
    }

    if (controlledValue === undefined) setInternalDate(newDate)
    onChange?.(newDate)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (!val) return

    const [hoursStr, minutesStr] = val.split(":")
    const hours = parseInt(hoursStr, 10)
    const minutes = parseInt(minutesStr, 10)

    const baseDate = date ? new Date(date) : new Date()
    baseDate.setHours(hours, minutes, 0, 0)

    if (controlledValue === undefined) setInternalDate(baseDate)
    onChange?.(baseDate)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (controlledValue === undefined) setInternalDate(undefined)
    onChange?.(undefined)
  }

  function handleSetNow() {
    const now = new Date()
    if (controlledValue === undefined) setInternalDate(now)
    onChange?.(now)
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
              "w-full justify-start text-left font-normal h-11 rounded-xl border-border/80 bg-background shadow-2xs hover:bg-muted/40 px-3.5 text-sm transition-colors",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2.5 size-4 text-primary shrink-0" />
            <span className="flex-1 truncate">
              {date ? format(date, "PPP · p") : placeholder}
            </span>
            {date && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)
                }
                className="ml-1 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear date & time"
              >
                <X className="size-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 rounded-2xl shadow-xl border-border/80 bg-popover"
          align="start"
        >
          {/* Calendar Day Picker */}
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

          {/* Time Picker Controls Bar */}
          <div className="p-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Time:</span>
              <Input
                type="time"
                value={timeString}
                onChange={handleTimeChange}
                disabled={disabled}
                className="h-8 w-28 rounded-lg text-xs bg-background border-border/80 font-medium px-2 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSetNow}
                className="h-8 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Now
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 px-3 text-xs font-semibold rounded-lg"
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
