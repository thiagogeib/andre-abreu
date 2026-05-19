import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  User,
  BookOpen,
  Plus,
  ExternalLink,
} from "lucide-react"
import type { ProgramStatus, ProgramType } from "@/generated/prisma"
import { CreateUserForm } from "./create-user-form"

const TYPE_LABELS: Record<ProgramType, string> = {
  PALESTRA: "Palestra",
  WORKSHOP: "Workshop",
  TREINAMENTO: "Treinamento",
  PROGRAMA: "Programa",
}

const STATUS_LABELS: Record<ProgramStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const STATUS_COLORS: Record<ProgramStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClienteDetailPage({ params }: PageProps) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { id } = await params

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: "CLIENT" },
        select: { id: true, name: true, email: true, isActive: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      programs: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
          _count: { select: { sessions: true } },
        },
      },
    },
  })

  if (!company) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/painel/clientes"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{company.name}</h1>
            <Badge
              variant="outline"
              className={
                company.isActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {company.isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          {company.legalName && (
            <p className="text-sm text-muted-foreground mt-0.5">{company.legalName}</p>
          )}
        </div>
        <Link
          href={`/painel/programas/novo`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 cursor-pointer")}
        >
          <Plus className="size-3.5" />
          Novo programa
        </Link>
      </div>

      {/* Dados da empresa */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-border">
          <Building2 className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {company.cnpj && (
              <div>
                <p className="text-[11px] text-muted-foreground">CNPJ</p>
                <p className="text-sm font-mono text-foreground">{company.cnpj}</p>
              </div>
            )}
            {company.segment && (
              <div>
                <p className="text-[11px] text-muted-foreground">Segmento</p>
                <p className="text-sm text-foreground">{company.segment}</p>
              </div>
            )}
            {company.website && (
              <div>
                <p className="text-[11px] text-muted-foreground">Website</p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-foreground hover:underline"
                >
                  <Globe className="size-3.5" />
                  {company.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            <div>
              <p className="text-[11px] text-muted-foreground">Cadastrada em</p>
              <p className="text-sm text-foreground">{formatDate(company.createdAt)}</p>
            </div>
          </div>

          {(company.contactName || company.contactEmail || company.contactPhone) && (
            <>
              <Separator className="my-4" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Pessoa de contato
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {company.contactName && (
                  <div className="flex items-center gap-2">
                    <User className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-foreground">{company.contactName}</span>
                  </div>
                )}
                {company.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                    <a
                      href={`mailto:${company.contactEmail}`}
                      className="text-sm text-foreground hover:underline"
                    >
                      {company.contactEmail}
                    </a>
                  </div>
                )}
                {company.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                    <a
                      href={`tel:${company.contactPhone}`}
                      className="text-sm text-foreground hover:underline"
                    >
                      {company.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {company.notes && (
            <>
              <Separator className="my-4" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Notas internas
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{company.notes}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Programas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Programas ({company.programs.length})
            </CardTitle>
          </div>
          <Link
            href={`/painel/programas/novo`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-xs cursor-pointer")}
          >
            <Plus className="size-3.5" />
            Adicionar
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {company.programs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum programa cadastrado.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {company.programs.map((prog) => (
                <div key={prog.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{prog.title}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {TYPE_LABELS[prog.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {prog._count.sessions} {prog._count.sessions === 1 ? "sessão" : "sessões"}
                      </span>
                      {prog.startDate && (
                        <span className="text-xs text-muted-foreground">
                          · Início: {formatDate(prog.startDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={STATUS_COLORS[prog.status]}>
                      {STATUS_LABELS[prog.status]}
                    </Badge>
                    <Link
                      href={`/painel/programas/${prog.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
                      aria-label={`Ver programa ${prog.title}`}
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acessos de usuários */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-medium">
            Acessos à plataforma ({company.users.length})
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Usuários da empresa que podem acessar a área do cliente
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {company.users.length > 0 && (
            <div className="divide-y divide-border">
              {company.users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
                    style={{ background: "var(--brand-navy)", color: "var(--brand-gold)" }}
                  >
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      user.isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {user.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <Separator />
          <div className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Criar novo acesso
            </p>
            <CreateUserForm companyId={company.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
