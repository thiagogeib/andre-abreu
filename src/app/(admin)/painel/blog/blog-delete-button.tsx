"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  id: string
  title: string
}

export function BlogDeleteButton({ id, title }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return
    setLoading(true)
    await fetch(`/api/v1/blog/${id}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-label="Excluir post"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "cursor-pointer text-destructive hover:text-destructive disabled:opacity-50"
      )}
    >
      <Trash2 className="size-3.5" />
    </button>
  )
}
