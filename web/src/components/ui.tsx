// Umumiy, jim UI bo'laklari. Qoidalar: docs/DIZAYN.md → «Sahifa qoidalari».
import type { ReactNode } from 'react'

export type Ton = 'success' | 'warning' | 'destructive' | 'primary' | 'muted'

const NUQTA: Record<Ton, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  primary: 'bg-primary',
  muted: 'bg-muted-foreground/50',
}

/** Holat: rangli nuqta + so'z. Fon yo'q. */
export function Nuqta({ ton, children }: { ton: Ton; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${NUQTA[ton]}`} />
      {children}
    </span>
  )
}

export const tugma = {
  asosiy:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50',
  ikkinchi:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 font-medium transition-colors hover:bg-surface disabled:opacity-50',
  sokin:
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground',
}

export const maydon =
  'block min-h-11 w-full rounded-lg border border-border bg-card px-3 text-base outline-none transition-colors focus:border-foreground'

/** Ko'rsatkichlar: bitta ramka ichida ingichka chiziq bilan ajratilgan katakchalar. */
export function Korsatkichlar({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">{children}</dl>
  )
}

export function Korsatkich({ nom, qiymat, izoh }: { nom: string; qiymat: ReactNode; izoh?: ReactNode }) {
  return (
    <div className="bg-card p-4 sm:p-5">
      <dt className="text-sm text-muted-foreground">{nom}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{qiymat}</dd>
      {izoh && <dd className="mt-0.5 text-sm text-muted-foreground">{izoh}</dd>}
    </div>
  )
}

/** Sahifa sarlavhasi: nom, bir qator izoh va o'ngda amallar. */
export function SahifaSarlavha({ nom, izoh, amal }: { nom: string; izoh?: ReactNode; amal?: ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold">{nom}</h1>
        {izoh && <p className="mt-1 text-muted-foreground">{izoh}</p>}
      </div>
      {amal}
    </div>
  )
}

/** Tablar: pastki chiziq bilan. */
export function Tablar<T extends string>({
  qiymat,
  royxat,
  onTanla,
}: {
  qiymat: T
  royxat: { kalit: T; nom: string; soni?: number }[]
  onTanla: (k: T) => void
}) {
  return (
    <div className="flex gap-6 overflow-x-auto border-b border-border" role="tablist">
      {royxat.map((t) => (
        <button
          key={t.kalit}
          type="button"
          role="tab"
          aria-selected={qiymat === t.kalit}
          onClick={() => onTanla(t.kalit)}
          className={`-mb-px flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 text-sm font-medium transition-colors ${
            qiymat === t.kalit ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.nom}
          {t.soni != null && <span className="text-muted-foreground tabular-nums">{t.soni}</span>}
        </button>
      ))}
    </div>
  )
}
