import * as React from "react"
import Image from "next/image"
import { APP_NAME } from "@/lib/config"
import { cn } from "@/lib/utils"

export interface BrandLogoProps {
  logoUrl?: string | null
  alt?: string
  className?: string
  iconOnly?: boolean
  priority?: boolean
}

export function BrandLogo({
  logoUrl,
  alt = APP_NAME,
  className,
  iconOnly = false,
  priority = false,
}: BrandLogoProps) {
  // If custom logoUrl is provided from settings:
  if (logoUrl && logoUrl.trim().length > 0) {
    const isExternalOrUpload =
      logoUrl.startsWith("/uploads/") || logoUrl.startsWith("http")

    return (
      <div className={cn("relative flex items-center justify-center shrink-0", className)}>
        <Image
          src={logoUrl}
          alt={alt}
          width={iconOnly ? 36 : 140}
          height={36}
          priority={priority}
          unoptimized={isExternalOrUpload}
          className="h-full w-auto max-h-full object-contain"
        />
      </div>
    )
  }

  // Icon-only mode (e.g. collapsed sidebar, compact pill)
  if (iconOnly) {
    return (
      <div className={cn("relative flex items-center justify-center shrink-0 size-8 sm:size-9", className)}>
        <Image
          src="/images/logo-icon.png"
          alt={`${alt} Icon`}
          width={214}
          height={213}
          priority={priority}
          className="size-full object-contain"
        />
      </div>
    )
  }

  // Default Full Brand Logo with dynamic light/dark theme adaptation
  return (
    <div className={cn("relative inline-flex items-center shrink-0 select-none", className)}>
      {/* Light Mode Logo */}
      <Image
        src="/images/logo.png"
        alt={alt}
        width={536}
        height={225}
        priority={priority}
        className="h-full w-auto object-contain dark:hidden"
      />

      {/* Dark Mode Logo (White/Bright Crisp Typography) */}
      <Image
        src="/images/logo-dark.png"
        alt={alt}
        width={536}
        height={225}
        priority={priority}
        className="hidden h-full w-auto object-contain dark:block"
      />
    </div>
  )
}

