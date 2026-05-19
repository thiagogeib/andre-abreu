"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useUploadThing } from "@/lib/uploadthing"
import { FileText, Link2, Trash2, Plus, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MaterialType } from "@/generated/prisma"

const TYPE_LABELS: Record<MaterialType, string> = {
  PDF: "PDF",
  IMAGE: "Imagem",
  LINK: "Link",
  VIDEO_URL: "Vídeo",
  PRESENTATION: "Apresentação",
}

const LINK_TYPES: MaterialType[] = ["LINK", "VIDEO_URL"]

interface Material {
  id: string
  title: string
  description: string | null
  type: MaterialType
  url: string
  fileSize: number | null
}

interface Props {
  programId: string
  materials: Material[]
}

type Mode = "file" | "link"

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MaterialsSection({ programId, materials: initial }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("file")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkType, setLinkType] = useState<"LINK" | "VIDEO_URL">("LINK")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { startUpload } = useUploadThing("programMaterial")

  function reset() {
    setTitle("")
    setDescription("")
    setLinkUrl("")
    setLinkType("LINK")
    setFile(null)
    setError("")
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("Título obrigatório."); return }
    setError("")
    setUploading(true)

    try {
      let payload: Record<string, unknown>

      if (mode === "file") {
        if (!file) { setError("Selecione um arquivo."); return }
        const uploaded = await startUpload([file])
        if (!uploaded?.[0]) { setError("Erro ao fazer upload."); return }
        const { url, key, size } = uploaded[0]

        const ext = file.name.split(".").pop()?.toLowerCase()
        const type: MaterialType =
          ext === "pdf" ? "PDF"
          : ext === "ppt" || ext === "pptx" ? "PRESENTATION"
          : "IMAGE"

        payload = { title, description: description || undefined, type, url, fileKey: key, fileSize: size }
      } else {
        if (!linkUrl.trim()) { setError("URL obrigatória."); return }
        payload = { title, description: description || undefined, type: linkType, url: linkUrl }
      }

      const res = await fetch(`/api/v1/programs/${programId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError((d as { error?: string }).error ?? "Erro ao salvar.")
        return
      }

      reset()
      startTransition(() => router.refresh())
    } catch {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(materialId: string) {
    setDeleting(materialId)
    try {
      await fetch(`/api/v1/programs/${programId}/materials?materialId=${materialId}`, {
        method: "DELETE",
      })
      startTransition(() => router.refresh())
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-0">
      {/* Lista de materiais existentes */}
      {initial.length === 0 && !open && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum material adicionado ainda.
        </p>
      )}

      {initial.length > 0 && (
        <div className="divide-y divide-border">
          {initial.map((mat) => {
            const isLink = LINK_TYPES.includes(mat.type)
            return (
              <div key={mat.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {isLink ? (
                    <Link2 className="size-4 text-muted-foreground" />
                  ) : (
                    <FileText className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:underline truncate block"
                  >
                    {mat.title}
                  </a>
                  {mat.description && (
                    <p className="text-xs text-muted-foreground truncate">{mat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">
                    {TYPE_LABELS[mat.type]}
                  </Badge>
                  {mat.fileSize && (
                    <span className="text-[10px] text-muted-foreground">{formatBytes(mat.fileSize)}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(mat.id)}
                    disabled={deleting === mat.id}
                    className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-40"
                    aria-label="Remover material"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Formulário de adição */}
      {open ? (
        <div className="border-t border-border p-4 space-y-4">
          {/* Tabs file / link */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
            {(["file", "link"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  mode === m
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "file" ? "Arquivo" : "Link / URL"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Título</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Apostila — Módulo 1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Descrição <span className="font-normal">(opcional)</span>
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição"
              />
            </div>

            {mode === "file" ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Arquivo</Label>
                {file ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/40">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 p-6 rounded-lg border border-dashed border-border hover:border-foreground/30 transition-colors cursor-pointer">
                    <Upload className="size-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center">
                      PDF, PPT, PPTX ou imagem · máx. 64 MB
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.ppt,.pptx,image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
                  <div className="flex gap-2">
                    {(["LINK", "VIDEO_URL"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLinkType(t)}
                        className={cn(
                          "flex-1 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                          linkType === t
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground/40"
                        )}
                      >
                        {t === "LINK" ? "Link" : "Vídeo"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">URL</Label>
                  <Input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder={linkType === "VIDEO_URL" ? "https://youtube.com/..." : "https://..."}
                    required
                  />
                </div>
              </>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={uploading || isPending}
                className="flex-1 h-8 rounded-lg bg-foreground text-background text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-opacity"
              >
                {uploading ? "Enviando..." : isPending ? "Salvando..." : "Adicionar material"}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={uploading}
                className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={cn("p-4", initial.length > 0 && "border-t border-border")}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
            Adicionar material
          </button>
        </div>
      )}
    </div>
  )
}
