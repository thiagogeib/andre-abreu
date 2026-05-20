"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface DepoimentoFormProps {
  initialData?: {
    id: string
    authorName: string
    authorRole: string | null
    company: string | null
    content: string
    avatarUrl: string | null
    isPublished: boolean
    order: number
  }
}

export function DepoimentoForm({ initialData }: DepoimentoFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [authorName, setAuthorName] = useState(initialData?.authorName ?? "")
  const [authorRole, setAuthorRole] = useState(initialData?.authorRole ?? "")
  const [company, setCompany] = useState(initialData?.company ?? "")
  const [content, setContent] = useState(initialData?.content ?? "")
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl ?? "")
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [order, setOrder] = useState(initialData?.order ?? 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authorName || !content) {
      setError("Nome do autor e depoimento são obrigatórios.")
      return
    }

    setError("")
    setLoading(true)

    const payload = {
      authorName,
      authorRole: authorRole || null,
      company: company || null,
      content,
      avatarUrl: avatarUrl || null,
      isPublished,
      order,
    }

    const res = await fetch(
      isEdit ? `/api/v1/testimonials/${initialData.id}` : "/api/v1/testimonials",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Erro ao salvar depoimento.")
      return
    }

    router.push("/painel/depoimentos")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="authorName">Nome do autor *</Label>
          <Input
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="João Silva"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="authorRole">Cargo</Label>
          <Input
            id="authorRole"
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            placeholder="Diretor de Operações"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Empresa S.A."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Ordem de exibição</Label>
          <Input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Depoimento *</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva o depoimento..."
          rows={4}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="avatarUrl">URL do avatar</Label>
        <Input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPublished"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="rounded border-input"
        />
        <Label htmlFor="isPublished" className="cursor-pointer">
          Publicar no site
        </Label>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar depoimento"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/painel/depoimentos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
