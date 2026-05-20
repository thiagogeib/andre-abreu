"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface BlogFormProps {
  initialData?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverUrl: string | null
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    tags: string[]
    metaTitle: string | null
    metaDescription: string | null
  }
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [slug, setSlug] = useState(initialData?.slug ?? "")
  const [slugManual, setSlugManual] = useState(isEdit)
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "")
  const [content, setContent] = useState(initialData?.content ?? "")
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl ?? "")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    initialData?.status ?? "DRAFT"
  )
  const [tags, setTags] = useState(initialData?.tags.join(", ") ?? "")
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "")
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!slugManual) setSlug(toSlug(title))
  }, [title, slugManual])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !slug || !content) {
      setError("Título, slug e conteúdo são obrigatórios.")
      return
    }

    setError("")
    setLoading(true)

    const payload = {
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      coverUrl: coverUrl || undefined,
      status,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
    }

    const res = await fetch(
      isEdit ? `/api/v1/blog/${initialData.id}` : "/api/v1/blog",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Erro ao salvar post.")
      return
    }

    router.push("/painel/blog")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Título e Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do post"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">
            Slug *
            {!slugManual && (
              <button
                type="button"
                className="ml-2 text-xs text-muted-foreground underline hover:text-foreground"
                onClick={() => setSlugManual(true)}
              >
                editar
              </button>
            )}
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlugManual(true)
              setSlug(e.target.value)
            }}
            placeholder="meu-post"
            required
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </div>

      {/* Resumo */}
      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Resumo</Label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Breve descrição para listagem e SEO"
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      {/* Conteúdo */}
      <div className="space-y-1.5">
        <Label htmlFor="content">Conteúdo * (Markdown)</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva o conteúdo em Markdown..."
          rows={16}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
        />
      </div>

      {/* Cover URL */}
      <div className="space-y-1.5">
        <Label htmlFor="coverUrl">URL da imagem de capa</Label>
        <Input
          id="coverUrl"
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="aviação, liderança, segurança"
        />
      </div>

      {/* Meta */}
      <details className="space-y-4">
        <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
          SEO (meta tags)
        </summary>
        <div className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="metaTitle">Meta título</Label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Título para mecanismos de busca"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metaDescription">Meta descrição</Label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              placeholder="Descrição para mecanismos de busca (até 160 caracteres)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>
      </details>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar post"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/painel/blog")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
