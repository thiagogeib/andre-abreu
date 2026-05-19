import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ArrowLeft, Mail, Phone, Building2, Briefcase, MessageSquare, Calendar } from "lucide-react"
import type { LeadStatus } from "@/generated/prisma"
import { LeadStatusSelect } from "./lead-status-select"

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Novo",
  READ: "Lido",
  REPLIED: "Respondido",
  ARCHIVED: "Arquivado",
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  READ: "bg-muted text-muted-foreground",
  REPLIED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  ARCHIVED: "bg-muted text-muted-foreground/60",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { id } = await params
  const lead = await prisma.contactLead.findUnique({ where: { id } })
  if (!lead) notFound()

  // Marca como lido automaticamente se ainda for NEW
  if (lead.status === "NEW") {
    await prisma.contactLead.update({
      where: { id },
      data: { status: "READ" },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/painel/leads"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">Mensagem de {lead.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <Calendar className="inline size-3 mr-1" />
            {formatDate(lead.createdAt)}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_COLORS[lead.status]}>
          {STATUS_LABELS[lead.status]}
        </Badge>
      </div>

      {/* Dados do contato */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-medium">Dados do contato</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Mail className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <a
                  href={`mailto:${lead.email}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            </div>
            {lead.phone && (
              <div className="flex items-start gap-2.5">
                <Phone className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    {lead.phone}
                  </a>
                </div>
              </div>
            )}
            {lead.company && (
              <div className="flex items-start gap-2.5">
                <Building2 className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="text-sm font-medium text-foreground">{lead.company}</p>
                </div>
              </div>
            )}
            {lead.jobRole && (
              <div className="flex items-start gap-2.5">
                <Briefcase className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cargo</p>
                  <p className="text-sm font-medium text-foreground">{lead.jobRole}</p>
                </div>
              </div>
            )}
          </div>
          {lead.serviceType && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Serviço de interesse</p>
                <Badge variant="secondary">{lead.serviceType}</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mensagem */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Mensagem</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {lead.message}
          </p>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-medium">Atualizar status</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
        </CardContent>
      </Card>

      {/* Link para responder por e-mail */}
      <div className="flex items-center gap-3">
        <a
          href={`mailto:${lead.email}?subject=Re: Contato via site André Abreu Aviação`}
          className={cn(buttonVariants({ variant: "default" }), "gap-2 cursor-pointer")}
        >
          <Mail className="size-4" />
          Responder por e-mail
        </a>
        <Link
          href="/painel/leads"
          className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
        >
          Voltar à lista
        </Link>
      </div>
    </div>
  )
}
