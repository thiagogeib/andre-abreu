"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ArrowLeft, BookOpen } from "lucide-react"

const programSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  type: z.enum(["PALESTRA", "WORKSHOP", "TREINAMENTO", "PROGRAMA"]),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]),
  objectives: z.string().optional(),
  audience: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  companyId: z.string().min(1, "Selecione a empresa"),
})

type FormValues = z.infer<typeof programSchema>

interface Company {
  id: string
  name: string
}

export default function NovoProgramaPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    fetch("/api/v1/companies?pageSize=100")
      .then((r) => r.json())
      .then((d) => setCompanies(d.data ?? []))
      .catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      status: "DRAFT" as const,
      title: "",
      description: "",
      objectives: "",
      audience: "",
      startDate: "",
      endDate: "",
      companyId: "",
    },
  })

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
    }

    const res = await fetch("/api/v1/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error((data as { error?: string }).error ?? "Erro ao criar programa")
      return
    }

    const { data } = await res.json()
    toast.success("Programa criado com sucesso")
    router.push(`/painel/programas/${data.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/painel/programas"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Novo programa</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Crie um programa de treinamento para um cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Dados básicos */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-border">
            <BookOpen className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Dados do programa</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Liderança e Segurança em Aviação"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="type">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <select
                  id="type"
                  aria-invalid={!!errors.type}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 appearance-none"
                  {...register("type")}
                >
                  <option value="">Selecione...</option>
                  <option value="PALESTRA">Palestra</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="TREINAMENTO">Treinamento</option>
                  <option value="PROGRAMA">Programa</option>
                </select>
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 appearance-none"
                  {...register("status")}
                >
                  <option value="DRAFT">Rascunho</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="PAUSED">Pausado</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyId">
                Empresa <span className="text-destructive">*</span>
              </Label>
              <select
                id="companyId"
                aria-invalid={!!errors.companyId}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 appearance-none"
                {...register("companyId")}
              >
                <option value="">Selecione a empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="text-xs text-destructive">{errors.companyId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição geral do programa..."
                className="min-h-20 resize-none"
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do conteúdo */}
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium">Conteúdo</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="objectives">Objetivos</Label>
              <Textarea
                id="objectives"
                placeholder="O que os participantes vão aprender ou alcançar..."
                className="min-h-20 resize-none"
                {...register("objectives")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audience">Público-alvo</Label>
              <Input
                id="audience"
                placeholder="Ex: Pilotos, comissários, gestores de aviação..."
                {...register("audience")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium">Período</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Data de início</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Data de término</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/painel/programas"
            className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-8 px-3 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {isSubmitting ? "Criando..." : "Criar programa"}
          </button>
        </div>
      </form>
    </div>
  )
}
