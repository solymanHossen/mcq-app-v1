import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Examination",
  description: "Secure, distraction-free assessment environment",
}

export default function ExamTakingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-[#F7FAFA] dark:bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      {children}
    </div>
  )
}

