import type { ReactNode } from 'react'

/** Dumaloq ikonka tugmasi uchun klass: faol — to'q sariq, aks holda yumshoq. */
export const ikonKlass = (faol: boolean) =>
  `flex h-9 w-9 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
    faol ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
  }`

/**
 * Ikonka + ostida tooltip (sichqoncha yoki klaviatura bilan kelganda).
 * Tooltip o'ngga tekislangan — ekran chetidan chiqib ketmaydi.
 */
export function Ikon({ nom, children }: { nom: string; children: (cls: (faol: boolean) => string) => ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children(ikonKlass)}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full right-0 z-20 mt-2 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {nom}
      </span>
    </span>
  )
}
