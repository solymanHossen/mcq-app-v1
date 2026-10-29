"use server"

import { prisma } from "@/lib/prisma"
import { assertRole, TEACHER_ROLES } from "@/lib/authorization"
import { revalidatePath } from "next/cache"

export type TitleTemplateDTO = {
  id: string
  title: string
  category: string
  subject: string | null
  examType: string | null
  year: string | null
  isSystem: boolean
  teacherId: string | null
  createdAt: string
}

import { DEFAULT_SYSTEM_TEMPLATES } from "./template-constants"



export async function getTitleTemplatesAction(): Promise<{
  success: boolean
  templates: TitleTemplateDTO[]
  error?: string
}> {
  try {
    const user = await assertRole(...TEACHER_ROLES)

    // Ensure system templates exist in database on first fetch
    const systemCount = await prisma.examTitleTemplate.count({
      where: { isSystem: true },
    })

    if (systemCount === 0) {
      await prisma.examTitleTemplate.createMany({
        data: DEFAULT_SYSTEM_TEMPLATES.map((t) => ({
          ...t,
          isSystem: true,
          teacherId: null,
        })),
        skipDuplicates: true,
      })
    }

    // Fetch user's custom saved templates + system templates
    const templates = await prisma.examTitleTemplate.findMany({
      where: {
        OR: [
          { isSystem: true },
          { teacherId: user.id },
        ],
      },
      orderBy: [
        { isSystem: "asc" }, // user templates first
        { createdAt: "desc" },
      ],
    })

    return {
      success: true,
      templates: templates.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        subject: t.subject,
        examType: t.examType,
        year: t.year,
        isSystem: t.isSystem,
        teacherId: t.teacherId,
        createdAt: t.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error("[getTitleTemplatesAction]", error)
    return {
      success: false,
      templates: [],
      error: error instanceof Error ? error.message : "Failed to load templates",
    }
  }
}

export async function saveTitleTemplateAction(params: {
  title: string
  category?: string
  subject?: string
  examType?: string
  year?: string
}): Promise<{
  success: boolean
  template?: TitleTemplateDTO
  error?: string
}> {
  try {
    const user = await assertRole(...TEACHER_ROLES)

    const trimmedTitle = params.title.trim()
    if (trimmedTitle.length < 3) {
      return { success: false, error: "Title must be at least 3 characters" }
    }

    // Prevent duplicate title for this teacher
    const existing = await prisma.examTitleTemplate.findFirst({
      where: {
        title: trimmedTitle,
        teacherId: user.id,
      },
    })

    if (existing) {
      return {
        success: true,
        template: {
          id: existing.id,
          title: existing.title,
          category: existing.category,
          subject: existing.subject,
          examType: existing.examType,
          year: existing.year,
          isSystem: existing.isSystem,
          teacherId: existing.teacherId,
          createdAt: existing.createdAt.toISOString(),
        },
      }
    }

    const created = await prisma.examTitleTemplate.create({
      data: {
        title: trimmedTitle,
        category: params.category || "Custom",
        subject: params.subject || null,
        examType: params.examType || null,
        year: params.year || null,
        isSystem: false,
        teacherId: user.id,
      },
    })

    revalidatePath("/teacher/exams/new")

    return {
      success: true,
      template: {
        id: created.id,
        title: created.title,
        category: created.category,
        subject: created.subject,
        examType: created.examType,
        year: created.year,
        isSystem: created.isSystem,
        teacherId: created.teacherId,
        createdAt: created.createdAt.toISOString(),
      },
    }
  } catch (error) {
    console.error("[saveTitleTemplateAction]", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save template",
    }
  }
}

export async function deleteTitleTemplateAction(templateId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await assertRole(...TEACHER_ROLES)

    const template = await prisma.examTitleTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return { success: false, error: "Template not found" }
    }

    if (template.isSystem || template.teacherId !== user.id) {
      return { success: false, error: "You cannot delete this template" }
    }

    await prisma.examTitleTemplate.delete({
      where: { id: templateId },
    })

    revalidatePath("/teacher/exams/new")

    return { success: true }
  } catch (error) {
    console.error("[deleteTitleTemplateAction]", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete template",
    }
  }
}
