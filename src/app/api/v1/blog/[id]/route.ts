import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1).optional(),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}

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

  const current = await prisma.blogPost.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (parsed.data.slug && parsed.data.slug !== current.slug) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) return NextResponse.json({ error: "Slug já está em uso." }, { status: 409 })
  }

  const publishedAt =
    parsed.data.status === "PUBLISHED" && !current.publishedAt
      ? new Date()
      : current.publishedAt

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...parsed.data,
      coverUrl: parsed.data.coverUrl === "" ? null : parsed.data.coverUrl,
      publishedAt,
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.blogPost.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
