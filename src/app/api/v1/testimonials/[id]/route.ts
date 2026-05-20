import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  authorName: z.string().min(1).optional(),
  authorRole: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  content: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  isPublished: z.boolean().optional(),
  order: z.number().int().optional(),
})

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      ...parsed.data,
      avatarUrl: parsed.data.avatarUrl === "" ? null : parsed.data.avatarUrl,
    },
  })

  return NextResponse.json(testimonial)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.testimonial.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
