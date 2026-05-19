import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { MaterialType } from "@/generated/prisma"

const VALID_TYPES: MaterialType[] = ["PDF", "IMAGE", "LINK", "VIDEO_URL", "PRESENTATION"]

const materialSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["PDF", "IMAGE", "LINK", "VIDEO_URL", "PRESENTATION"]),
  url: z.string().url("URL inválida"),
  fileKey: z.string().optional(),
  fileSize: z.number().int().optional(),
  isPublic: z.boolean().optional(),
})

interface Ctx {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id: programId } = await params

  const program = await prisma.program.findUnique({ where: { id: programId }, select: { id: true } })
  if (!program) return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = materialSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  const material = await prisma.material.create({
    data: { ...parsed.data, programId },
  })

  return NextResponse.json({ data: material }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id: programId } = await params
  const materialId = req.nextUrl.searchParams.get("materialId")
  if (!materialId) return NextResponse.json({ error: "materialId obrigatório" }, { status: 400 })

  const material = await prisma.material.findFirst({
    where: { id: materialId, programId },
  })
  if (!material) return NextResponse.json({ error: "Material não encontrado" }, { status: 404 })

  await prisma.material.delete({ where: { id: materialId } })
  return NextResponse.json({ ok: true })
}
