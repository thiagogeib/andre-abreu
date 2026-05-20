import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  authorName: z.string().min(1),
  authorRole: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(1),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
  order: z.number().int().default(0),
})

export async function GET() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(testimonials)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      ...parsed.data,
      avatarUrl: parsed.data.avatarUrl || null,
      authorRole: parsed.data.authorRole || null,
      company: parsed.data.company || null,
    },
  })

  return NextResponse.json(testimonial, { status: 201 })
}
