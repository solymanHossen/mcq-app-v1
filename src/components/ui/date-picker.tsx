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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
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
  const isMobile = useIsMobile()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left font-normal h-10 rounded-xl border-border/80 bg-background shadow-2xs hover:bg-muted/40 px-3 cursor-pointer",
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
          onKeyDown={(e) =>
            e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)
          }
          className="ml-1 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Clear date"
        >
          <X className="size-3.5" />
        </span>
      )}
    </Button>
  )

  const calendarBody = (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        disabled={(d) =>
          (minDate ? d < minDate : false) || (maxDate ? d > maxDate : false)
        }
        autoFocus
      />
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
            className="p-0 rounded-t-3xl max-h-[85vh] flex flex-col bg-popover border-t border-border/80 shadow-2xl overflow-hidden focus:outline-none"
          >
            <div className="pt-2.5 pb-2 px-4 border-b border-border/50 bg-muted/20 flex flex-col items-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <div className="flex items-center justify-between w-full">
                <SheetTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarIcon className="size-4 text-primary" />
                  <span>Pick Date</span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Choose a date from the calendar
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
            <div className="overflow-y-auto flex-1 min-h-0 p-3">
              {calendarBody}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 rounded-2xl shadow-lg border-border/80"
            align="start"
            sideOffset={6}
            collisionPadding={12}
          >
            {calendarBody}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
