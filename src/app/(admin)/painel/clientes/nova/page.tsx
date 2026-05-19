"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ArrowLeft, Building2 } from "lucide-react"

const companySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  legalName: z.string().optional(),
  cnpj: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.replace(/\D/g, "").length === 14,
      "CNPJ deve ter 14 dígitos"
    ),
  segment: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.startsWith("http://") || v.startsWith("https://"),
      "Website deve começar com http:// ou https://"
    ),
  contactName: z.string().optional(),
  contactEmail: z
    .string()
    .optional()
    .refine(
      (v) => !v || z.string().email().safeParse(v).success,
      "E-mail inválido"
    ),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof companySchema>

export default function NovaEmpresaPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      legalName: "",
      cnpj: "",
      segment: "",
      website: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
  })

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/v1/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error((data as { error?: string }).error ?? "Erro ao criar empresa")
      return
    }

    toast.success("Empresa criada com sucesso")
    router.push("/painel/clientes")
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/painel/clientes"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "cursor-pointer"
          )}
          aria-label="Voltar para clientes"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Nova empresa</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cadastre uma nova empresa cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-border">
            <Building2 className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Dados da empresa</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Azul Linhas Aéreas"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="legalName">Razão social</Label>
                <Input
                  id="legalName"
                  placeholder="Ex: Azul Linhas Aéreas Brasileiras S.A."
                  {...register("legalName")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  aria-invalid={!!errors.cnpj}
                  {...register("cnpj")}
                />
                {errors.cnpj && (
                  <p className="text-xs text-destructive">{errors.cnpj.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="segment">Segmento</Label>
                <Input
                  id="segment"
                  placeholder="Ex: Aviação Comercial, Corporativa..."
                  {...register("segment")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://empresa.com.br"
                aria-invalid={!!errors.website}
                {...register("website")}
              />
              {errors.website && (
                <p className="text-xs text-destructive">{errors.website.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium">Pessoa de contato</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Nome</Label>
              <Input
                id="contactName"
                placeholder="Nome do responsável"
                {...register("contactName")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail">E-mail</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  aria-invalid={!!errors.contactEmail}
                  {...register("contactEmail")}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-destructive">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPhone">Telefone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  {...register("contactPhone")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium">Observações internas</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre a empresa, contexto de contratação, preferências..."
                className="min-h-24 resize-none"
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/painel/clientes"
            className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
            {isSubmitting ? "Salvando..." : "Criar empresa"}
          </Button>
        </div>
      </form>
    </div>
  )
}
