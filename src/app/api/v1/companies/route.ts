import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const urlOrEmpty = z.union([z.string().url(), z.literal(""), z.undefined()])
const emailOrEmpty = z.union([z.string().email(), z.literal(""), z.undefined()])

const createCompanySchema = z.object({
  name: z.string().min(2),
  legalName: z.string().optional(),
  cnpj: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return undefined
      const digits = v.replace(/\D/g, "")
      return digits.length === 14 ? digits : undefined
    }),
  segment: z.string().optional(),
  website: urlOrEmpty,
  contactName: z.string().optional(),
  contactEmail: emailOrEmpty,
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
})

const listQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const query = listQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? 1,
    pageSize: searchParams.get("pageSize") ?? 20,
  })

  if (!query.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  }

  const { q, page, pageSize } = query.data
  const skip = (page - 1) * pageSize

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { legalName: { contains: q, mode: "insensitive" as const } },
          { cnpj: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        legalName: true,
        cnpj: true,
        segment: true,
        website: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { programs: true } },
      },
    }),
    prisma.company.count({ where }),
  ])

  return NextResponse.json({
    data: companies,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
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
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 })
  }

  const parsed = createCompanySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const {
    name,
    legalName,
    cnpj,
    segment,
    website,
    contactName,
    contactEmail,
    contactPhone,
    notes,
  } = parsed.data

  if (cnpj) {
    const existing = await prisma.company.findUnique({ where: { cnpj } })
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma empresa com este CNPJ" },
        { status: 409 }
      )
    }
  }

  const company = await prisma.company.create({
    data: {
      name,
      legalName: legalName || null,
      cnpj: cnpj || null,
      segment: segment || null,
      website: website || null,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      notes: notes || null,
    },
    select: {
      id: true,
      name: true,
      legalName: true,
      cnpj: true,
      segment: true,
      website: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      isActive: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ data: company }, { status: 201 })
}
