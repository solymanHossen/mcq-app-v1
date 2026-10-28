"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
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

export function DatePicker({
  id,
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultValue
  )
  const [open, setOpen] = React.useState(false)

  const date = controlledValue !== undefined ? controlledValue : internalDate

  function handleSelect(selectedDate: Date | undefined) {
    if (controlledValue === undefined) {
      setInternalDate(selectedDate)
    }
    onChange?.(selectedDate)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (controlledValue === undefined) {
      setInternalDate(undefined)
    }
    onChange?.(undefined)
  }

  // Format value for hidden input (YYYY-MM-DD)
  const hiddenValue = date ? format(date, "yyyy-MM-dd") : ""

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
              "w-full justify-start text-left font-normal h-10 rounded-xl border-border/80 bg-background shadow-2xs hover:bg-muted/40 px-3",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
            <span className="flex-1 truncate">
              {date ? format(date, "PPP") : placeholder}
            </span>
            {date && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                className="ml-1 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear date"
              >
                <X className="size-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border-border/80" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(d) => (minDate ? d < minDate : false) || (maxDate ? d > maxDate : false)}
            autoFocus
          />

        </PopoverContent>
      </Popover>
    </div>
  )
}
