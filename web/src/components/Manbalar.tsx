import { ExternalLink, FileText, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Iqtibos } from '@/lib/bloklar'

const domen = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Agent javobi ostidagi manba chiplari. Bosilganda keltirilgan parcha ochiladi. */
export function ManbaChiplari({ manbalar }: { manbalar: Iqtibos[] }) {
  const [ochiq, setOchiq] = useState<number | null>(null)
  const karta = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ochiq !== null) karta.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [ochiq])
  if (!manbalar.length) return null
  const tanlangan = ochiq === null ? null : manbalar[ochiq]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Manba:</span>
        {manbalar.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOchiq(ochiq === i ? null : i)}
            aria-expanded={ochiq === i}
            className={`flex min-h-8 max-w-full items-center gap-1 rounded-full border px-2.5 text-xs ${
              ochiq === i
                ? 'border-foreground/40 bg-foreground/10'
                : 'border-border bg-card hover:bg-foreground/5'
            }`}
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-foreground/10 text-[10px] font-semibold tabular-nums">
              {i + 1}
            </span>
            <span className="truncate">{m.nom}</span>
          </button>
        ))}
      </div>

      {tanlangan && (
        <div ref={karta} className="rounded-lg border border-border bg-card p-3 text-sm">
          <div className="mb-2 flex items-start gap-2">
            <FileText size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{tanlangan.nom}</p>
              <p className="text-xs text-muted-foreground">{domen(tanlangan.url)}</p>
            </div>
            <button type="button" onClick={() => setOchiq(null)} aria-label="Yopish" className="p-1 text-muted-foreground">
              <X size={14} />
            </button>
          </div>
          {tanlangan.parcha && (
            <blockquote className="rounded-none border-l-2 border-primary/60 py-0.5 pl-3 text-foreground/90">
              «{tanlangan.parcha}»
            </blockquote>
          )}
          <a
            href={tanlangan.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs font-medium underline underline-offset-2"
          >
            Manbani ochish <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  )
}
