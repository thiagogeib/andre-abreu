import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeft, Award } from "lucide-react"
import type { ProgramType } from "@/generated/prisma"
import { PrintButton } from "./print-button"

const TYPE_LABELS: Record<ProgramType, string> = {
  PALESTRA: "Palestra",
  WORKSHOP: "Workshop",
  TREINAMENTO: "Treinamento",
  PROGRAMA: "Programa",
}

function formatDate(date: Date | null) {
  if (!date) return ""
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function CertificadoPage({ params }: Props) {
  const session = await auth()
  if (!session || session.user.role !== "CLIENT") redirect("/login")
  if (!session.user.companyId) redirect("/area/dashboard")

  const { id } = await params

  const program = await prisma.program.findFirst({
    where: { id, companyId: session.user.companyId, status: "COMPLETED" },
    include: { company: true },
  })

  if (!program) notFound()

  const completedSessions = await prisma.programSession.count({
    where: { programId: program.id, status: "COMPLETED" },
  })

  const totalHours = await prisma.programSession.aggregate({
    where: { programId: program.id, status: "COMPLETED" },
    _sum: { duration: true },
  })

  const hoursNum = Math.round((totalHours._sum.duration ?? 0) / 60)
  const completionDate = program.endDate ?? new Date()

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Actions bar — hidden on print */}
      <div className="print:hidden bg-white border-b px-6 py-3 flex items-center justify-between gap-4">
        <Link href={`/area/programas/${program.id}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao programa
        </Link>
        <PrintButton />
      </div>

      {/* Certificate */}
      <div className="flex-1 flex items-center justify-center p-8 print:p-0">
        <div
          id="certificate"
          className="bg-white w-full max-w-4xl aspect-[1.414/1] relative overflow-hidden shadow-2xl print:shadow-none"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {/* Border decoration */}
          <div className="absolute inset-3 border-2 border-slate-200 pointer-events-none" />
          <div className="absolute inset-5 border border-slate-100 pointer-events-none" />

          {/* Gold accent top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

          {/* Corner ornaments */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-amber-500/40" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-amber-500/40" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-amber-500/40" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-amber-500/40" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-16 py-12 gap-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-amber-500" />
              <p className="text-xs font-sans font-semibold tracking-[0.3em] uppercase text-slate-400">
                Certificado de Conclusão
              </p>
              <Award className="w-8 h-8 text-amber-500" />
            </div>

            <div className="w-20 h-px bg-amber-400/60 my-3" />

            <p className="text-sm font-sans text-slate-500 mb-1">Certificamos que</p>

            <h1 className="text-3xl font-bold text-slate-800 mt-1 mb-1">{program.company.name}</h1>

            <p className="text-sm font-sans text-slate-500 mt-2">concluiu com êxito o</p>

            <p className="text-xs font-sans font-semibold tracking-widest uppercase text-amber-600 mt-3 mb-1">
              {TYPE_LABELS[program.type]}
            </p>

            <h2 className="text-2xl font-bold text-slate-800 leading-tight max-w-lg mt-1">{program.title}</h2>

            {program.objectives && (
              <p className="text-xs font-sans text-slate-400 mt-3 max-w-md leading-relaxed line-clamp-2">
                {program.objectives}
              </p>
            )}

            <div className="w-20 h-px bg-amber-400/60 my-5" />

            {/* Stats row */}
            <div className="flex items-center gap-8 text-center">
              {completedSessions > 0 && (
                <div>
                  <p className="text-2xl font-bold text-slate-700">{completedSessions}</p>
                  <p className="text-xs font-sans text-slate-400 tracking-wide">
                    {completedSessions === 1 ? "Sessão" : "Sessões"}
                  </p>
                </div>
              )}
              {hoursNum > 0 && (
                <>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-2xl font-bold text-slate-700">{hoursNum}h</p>
                    <p className="text-xs font-sans text-slate-400 tracking-wide">Carga horária</p>
                  </div>
                </>
              )}
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-sm font-bold text-slate-700">{formatDate(completionDate)}</p>
                <p className="text-xs font-sans text-slate-400 tracking-wide">Data de conclusão</p>
              </div>
            </div>

            <div className="w-20 h-px bg-amber-400/60 my-5" />

            {/* Signature */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-40 h-px bg-slate-300" />
              <p className="text-sm font-bold text-slate-700 mt-1">André Abreu</p>
              <p className="text-xs font-sans text-slate-400 tracking-wide">Facilitador | Aviação Corporativa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
