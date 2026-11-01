import type { Metadata } from "next"
import { getSystemSettings } from "@/modules/settings/queries"
import { APP_NAME } from "@/lib/config"
import { ContactClient } from "./contact-client"

export const metadata: Metadata = {
  title: `Contact & Support — ${APP_NAME}`,
  description:
    "Get in touch with ExamHub academic support, inquire about institutional partnerships, or report test issues.",
}

export const instant = false

export default async function ContactPage() {
  const settings = await getSystemSettings()
  const contactEmail = settings.contactEmail?.trim() || "support@examhub.edu"

  return (
    <main className="flex-1 pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ContactClient contactEmail={contactEmail} />
      </div>
    </main>
  )
}
