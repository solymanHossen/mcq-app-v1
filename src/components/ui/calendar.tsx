"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar p-3 select-none bg-popover text-popover-foreground w-[280px]",
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full relative", defaultClassNames.root),
        months: cn("relative flex flex-col gap-3", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-2", defaultClassNames.month),
        nav: cn(
          "absolute top-0 inset-x-0 flex items-center justify-between w-full z-10 pointer-events-none",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-8 items-center justify-center font-bold text-sm text-foreground capitalize tracking-tight",
          defaultClassNames.month_caption
        ),
        caption_label: cn("font-bold text-sm select-none", defaultClassNames.caption_label),
        month_grid: cn("w-full border-collapse space-y-1", defaultClassNames.month_grid),
        weekdays: cn("flex justify-between w-full mb-1", defaultClassNames.weekdays),
        weekday: cn(
          "size-8.5 flex items-center justify-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex justify-between w-full mt-0.5", defaultClassNames.week),
        day: cn(
          "relative size-8.5 p-0 text-center select-none flex items-center justify-center",
          defaultClassNames.day
        ),
        day_button: cn(
          "rdp-day_button size-8.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center cursor-pointer hover:bg-muted hover:text-foreground active:scale-95 text-foreground select-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
          defaultClassNames.day_button
        ),
        selected: cn(
          "rdp-selected [&_button]:!bg-primary [&_button]:!text-primary-foreground [&_button]:font-bold [&_button]:shadow-xs [&_button]:scale-105 [&_button]:hover:!bg-primary/90",
          defaultClassNames.selected
        ),
        today: cn(
          "rdp-today [&_button]:border [&_button]:border-primary/50 [&_button]:text-primary [&_button]:font-bold",
          defaultClassNames.today
        ),
        outside: cn(
          "opacity-35 pointer-events-none [&_button]:text-muted-foreground/40",
          defaultClassNames.outside
        ),
        disabled: cn(
          "opacity-25 pointer-events-none line-through [&_button]:opacity-30",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootClass, rootRef, ...rootProps }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(rootClass)} {...rootProps} />
        ),
        Chevron: ({ className: chevronClass, orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("size-4", chevronClass)} />
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("size-4", chevronClass)} />
          }
          return <ChevronDown className={cn("size-4", chevronClass)} />
        },
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
