import { prisma } from "@/lib/prisma"
import type { ListSubscribersParams, SubscribersListResult } from "./types"
import type { Prisma } from "@/prisma/generated/prisma/client"

export async function listNewsletterSubscribers({
  page = 1,
  pageSize = 20,
  search,
  status = "ALL",
}: ListSubscribersParams = {}): Promise<SubscribersListResult> {
  const where: Prisma.NewsletterSubscriberWhereInput = {}

  if (search && search.trim().length > 0) {
    where.email = { contains: search.trim().toLowerCase(), mode: "insensitive" }
  }

  if (status && status !== "ALL") {
    where.status = status
  }

  const skip = (Math.max(1, page) - 1) * pageSize
  const take = pageSize

  const [subscribers, totalCount, totalAll, activeCount, unsubscribedCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { status: "SUBSCRIBED" } }),
    prisma.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
  ])

  return {
    subscribers,
    totalCount,
    metrics: {
      total: totalAll,
      activeCount,
      unsubscribedCount,
    },
  }
}

export async function getAllSubscribersForExport() {
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      status: true,
      source: true,
      createdAt: true,
    },
  })
}

