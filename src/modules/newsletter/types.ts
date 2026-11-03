import type { NewsletterStatus } from "@/prisma/generated/prisma/client"

export type { NewsletterStatus }

export interface NewsletterSubscriberItem {
  id: string
  email: string
  status: NewsletterStatus
  source: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ListSubscribersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: NewsletterStatus | "ALL"
}

export interface SubscribersListResult {
  subscribers: NewsletterSubscriberItem[]
  totalCount: number
  metrics: {
    total: number
    activeCount: number
    unsubscribedCount: number
  }
}

