import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createProgramSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["PALESTRA", "WORKSHOP", "TREINAMENTO", "PROGRAMA"]),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).default("DRAFT"),
  objectives: z.string().optional(),
  audience: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  companyId: z.string().cuid(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status")
  const companyId = searchParams.get("companyId")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (companyId) where.companyId = companyId

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
        _count: { select: { sessions: true, materials: true } },
      },
    }),
    prisma.program.count({ where }),
  ])

  return NextResponse.json({
    data: programs,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })
  }

  const parsed = createProgramSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const company = await prisma.company.findUnique({ where: { id: parsed.data.companyId } })
  if (!company) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
  }

  const program = await prisma.program.create({
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      company: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ data: program }, { status: 201 })
}
