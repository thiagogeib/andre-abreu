"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer"
    >
      Imprimir / Salvar PDF
    </button>
  )
}
