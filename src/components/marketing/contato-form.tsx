"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"

const NAVY_DEEP = "oklch(0.18 0.05 248)"
const GOLD = "oklch(0.74 0.14 81)"

const SERVICE_OPTIONS = [
  { value: "", label: "Selecione um formato" },
  { value: "palestra", label: "Palestra" },
  { value: "workshop", label: "Workshop" },
  { value: "treinamento", label: "Treinamento" },
  { value: "programa", label: "Programa em Fases" },
  { value: "nao_sei", label: "Não sei ainda — quero conversar" },
]

type FormState = "idle" | "loading" | "success" | "error"

interface FormData {
  name: string
  company: string
  email: string
  phone: string
  serviceType: string
  message: string
}

export function ContatoForm() {
  const [state, setState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [form, setForm] = useState<FormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  })

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === "loading") return

    setState("loading")
    setErrorMsg("")

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        message: form.message,
        serviceType: form.serviceType && form.serviceType !== "nao_sei"
          ? form.serviceType
          : undefined,
      }

      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = (data as { error?: string }).error ?? "Erro ao enviar mensagem."
        setErrorMsg(msg)
        setState("error")
        return
      }

      setState("success")
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-white/4 flex flex-col items-center justify-center gap-4 min-h-64 text-center">
        <div
          className="flex size-14 items-center justify-center rounded-full"
          style={{ background: `${GOLD}22` }}
        >
          <CheckCircle2 className="size-7" style={{ color: GOLD }} />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">Mensagem enviada!</p>
          <p className="text-white/50 text-sm mt-1">
            André Abreu entrará em contato em breve.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setState("idle")
            setForm({ name: "", company: "", email: "", phone: "", serviceType: "", message: "" })
          }}
          className="text-xs underline cursor-pointer"
          style={{ color: `${GOLD}99` }}
        >
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  const inputCls =
    "bg-white/8 border-white/15 text-white placeholder:text-white/25 focus-visible:ring-[oklch(0.74_0.14_81)]"

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-2xl border border-white/10 bg-white/4 space-y-5"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="nome" className="text-white/70 text-xs font-medium">
            Nome <span style={{ color: GOLD }}>*</span>
          </Label>
          <Input
            id="nome"
            placeholder="Seu nome"
            required
            value={form.name}
            onChange={set("name")}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="empresa" className="text-white/70 text-xs font-medium">
            Empresa
          </Label>
          <Input
            id="empresa"
            placeholder="Nome da empresa"
            value={form.company}
            onChange={set("company")}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/70 text-xs font-medium">
            E-mail <span style={{ color: GOLD }}>*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            required
            value={form.email}
            onChange={set("email")}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone" className="text-white/70 text-xs font-medium">
            Telefone
          </Label>
          <Input
            id="telefone"
            type="tel"
            placeholder="(11) 9xxxx-xxxx"
            value={form.phone}
            onChange={set("phone")}
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipo" className="text-white/70 text-xs font-medium">
          Tipo de interesse
        </Label>
        <select
          id="tipo"
          value={form.serviceType}
          onChange={set("serviceType")}
          className="w-full h-9 rounded-md border border-white/15 bg-white/8 text-white/80 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[oklch(0.74_0.14_81)] cursor-pointer appearance-none"
        >
          {SERVICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[oklch(0.18_0.05_248)]">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mensagem" className="text-white/70 text-xs font-medium">
          Mensagem <span style={{ color: GOLD }}>*</span>
        </Label>
        <Textarea
          id="mensagem"
          placeholder="Conte sobre a sua empresa e o que você quer transformar..."
          required
          rows={4}
          value={form.message}
          onChange={set("message")}
          className={`${inputCls} resize-none`}
        />
      </div>

      {state === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2.5">
          <AlertCircle className="size-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        style={{ background: GOLD, color: NAVY_DEEP }}
      >
        {state === "loading" ? (
          "Enviando..."
        ) : (
          <>
            Enviar mensagem
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
      <p className="text-center text-white/25 text-xs">Seus dados estão seguros. Sem spam.</p>
    </form>
  )
}
