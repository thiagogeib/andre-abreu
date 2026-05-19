import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createSessionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().positive().optional().nullable(),
  location: z.string().optional().nullable(),
  attendees: z.number().int().nonnegative().optional().nullable(),
})

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id: programId } = await params

  const program = await prisma.program.findUnique({ where: { id: programId } })
  if (!program) return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })
  }

  const parsed = createSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const programSession = await prisma.programSession.create({
    data: {
      ...parsed.data,
      scheduledAt: new Date(parsed.data.scheduledAt),
      programId,
    },
  })

  return NextResponse.json({ data: programSession }, { status: 201 })
}
