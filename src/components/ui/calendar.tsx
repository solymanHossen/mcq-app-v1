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
        "group/calendar w-full p-3 sm:p-4 select-none bg-popover text-popover-foreground",
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
        months: cn("relative flex flex-col gap-3 w-full", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-2.5", defaultClassNames.month),
        nav: cn(
          "absolute top-0 inset-x-0 flex items-center justify-between w-full z-10 pointer-events-none px-0.5",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto size-8.5 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto size-8.5 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-8.5 items-center justify-center font-extrabold text-base sm:text-lg text-foreground capitalize tracking-tight",
          defaultClassNames.month_caption
        ),
        caption_label: cn("font-extrabold text-base select-none", defaultClassNames.caption_label),
        month_grid: cn("w-full table-fixed border-collapse space-y-1 mt-1", defaultClassNames.month_grid),
        weekdays: cn("w-full border-b border-border/40 pb-1.5 mb-1", defaultClassNames.weekdays),
        weekday: cn(
          "w-[14.28%] text-center text-xs font-bold uppercase tracking-wider text-muted-foreground/80 select-none py-1",
          defaultClassNames.weekday
        ),
        week: cn("w-full mt-1", defaultClassNames.week),
        day: cn(
          "w-[14.28%] p-0.5 text-center relative",
          defaultClassNames.day
        ),
        day_button: cn(
          "rdp-day_button w-full h-10 sm:h-10.5 rounded-xl text-sm sm:text-base font-semibold transition-all flex items-center justify-center cursor-pointer hover:bg-muted hover:text-foreground active:scale-95 text-foreground select-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
          defaultClassNames.day_button
        ),
        selected: cn(
          "rdp-selected [&_button]:!bg-primary [&_button]:!text-primary-foreground [&_button]:font-bold [&_button]:shadow-sm [&_button]:scale-105 [&_button]:hover:!bg-primary/90",
          defaultClassNames.selected
        ),
        today: cn(
          "rdp-today [&_button]:border-2 [&_button]:border-primary/60 [&_button]:text-primary [&_button]:font-bold",
          defaultClassNames.today
        ),
        outside: cn(
          "opacity-30 pointer-events-none [&_button]:text-muted-foreground/30",
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
            return <ChevronLeft className={cn("size-4.5", chevronClass)} />
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("size-4.5", chevronClass)} />
          }
          return <ChevronDown className={cn("size-4.5", chevronClass)} />
        },
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
