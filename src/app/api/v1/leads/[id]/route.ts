import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]).optional(),
  adminNotes: z.string().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const lead = await prisma.contactLead.findUnique({ where: { id } })
  if (!lead) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  return NextResponse.json({ data: lead })
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 })
  }

  const lead = await prisma.contactLead.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ data: lead })
}
