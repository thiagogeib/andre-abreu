import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { leadSchema } from "@/schemas/lead.schema"
import type { LeadStatus } from "@/generated/prisma"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const ANDRE_EMAIL = process.env.ANDRE_EMAIL ?? "andre@andreabreuaviacao.com.br"
const FROM_EMAIL = process.env.RESEND_FROM ?? "noreply@andreabreuaviacao.com.br"

const VALID_STATUSES: LeadStatus[] = ["NEW", "READ", "REPLIED", "ARCHIVED"]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const statusParam = searchParams.get("status")
  const status = VALID_STATUSES.includes(statusParam as LeadStatus)
    ? (statusParam as LeadStatus)
    : null
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const where = status ? { status } : {}

  const [leads, total, counts] = await Promise.all([
    prisma.contactLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.contactLead.count({ where }),
    prisma.contactLead.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ])

  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count.status])
  )

  return NextResponse.json({
    data: leads,
    counts: countByStatus,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = leadSchema.safeParse(body)

    if (!data.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: data.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const lead = await prisma.contactLead.create({ data: data.data })

    if (resend) {
      const { name, email, phone, company, serviceType, message } = data.data
      const serviceLabel = serviceType
        ? ({ palestra: "Palestra", workshop: "Workshop", treinamento: "Treinamento", programa: "Programa em Fases" } as Record<string, string>)[serviceType] ?? serviceType
        : "Não informado"

      resend.emails.send({
        from: FROM_EMAIL,
        to: ANDRE_EMAIL,
        subject: `Novo lead: ${name}${company ? ` · ${company}` : ""}`,
        html: `
          <p>Novo contato pelo site.</p>
          <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
            <tr><td><strong>Nome</strong></td><td>${name}</td></tr>
            <tr><td><strong>E-mail</strong></td><td>${email}</td></tr>
            ${phone ? `<tr><td><strong>Telefone</strong></td><td>${phone}</td></tr>` : ""}
            ${company ? `<tr><td><strong>Empresa</strong></td><td>${company}</td></tr>` : ""}
            <tr><td><strong>Interesse</strong></td><td>${serviceLabel}</td></tr>
            <tr><td><strong>Mensagem</strong></td><td style="white-space:pre-wrap">${message}</td></tr>
          </table>
          <p style="margin-top:16px"><a href="https://andreabreuaviacao.com.br/painel/leads/${lead.id}">Ver no painel</a></p>
        `,
      }).catch(() => {})
    }

    return NextResponse.json({ data: { id: lead.id } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
