import type { Natija, Papka } from '@shared/types'
import { AlertCircle, ArrowUp, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { BlokKorsat } from '@/components/bloklar'
import { ManbaChiplari } from '@/components/Manbalar'
import { Matn } from '@/components/Matn'
import type { BoyXabar } from '@/lib/bloklar'

export function XabarPufak({
  xabar,
  natija,
  papka,
  onBelgila,
  holati,
}: {
  xabar: Pick<BoyXabar, 'kim' | 'matn' | 'bloklar' | 'manbalar'>
  natija: Natija | null
  papka?: Papka | null
  onBelgila?: (kalit: string, bajarildi: boolean) => void
  holati?: 'yuborilmoqda' | 'yuborilmadi'
}) {
  if (xabar.kim === 'tadbirkor') {
    return (
      <div className="flex flex-col items-end">
        <div
          className={`max-w-[80%] rounded-lg bg-primary-soft px-3 py-2 whitespace-pre-wrap ${holati ? 'opacity-70' : ''}`}
        >
          {xabar.matn}
        </div>
        {holati === 'yuborilmadi' && <span className="mt-1 text-xs text-destructive">Yuborilmadi</span>}
      </div>
    )
  }
  return (
    <div className="flex max-w-[92%] flex-col gap-2 sm:max-w-[85%]">
      {xabar.matn && (
        <div className="rounded-lg border border-border bg-card px-3 py-2">
          <Matn matn={xabar.matn} />
        </div>
      )}
      {xabar.bloklar?.map((b, i) => (
        <BlokKorsat key={i} blok={b} natija={natija} papka={papka} onBelgila={onBelgila} />
      ))}
      {xabar.manbalar && <ManbaChiplari manbalar={xabar.manbalar} />}
    </div>
  )
}

export function Kutish() {
  const [soniya, setSoniya] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSoniya((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <span className="flex gap-1 rounded-lg border border-border bg-card px-3 py-3">
        {[0, 150, 300].map((d) => (
          <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />
        ))}
      </span>
      {soniya >= 10 && <span>Agent o'ylayapti, biroz kuting…</span>}
    </div>
  )
}

export function Tugmalar({ tugmalar, onTanla }: { tugmalar: string[]; onTanla: (t: string) => void }) {
  if (!tugmalar.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tugmalar.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTanla(t)}
          className="min-h-11 rounded-full border border-border bg-card px-4 text-sm font-medium hover:border-primary hover:text-primary"
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export function XatoBanner({
  matn,
  onQayta,
  onYop,
}: {
  matn: string
  onQayta?: () => void
  onYop: () => void
}) {
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertCircle size={16} className="shrink-0" />
      <span className="min-w-0 flex-1">{matn}</span>
      {onQayta && (
        <button type="button" onClick={onQayta} className="flex min-h-9 items-center gap-1 font-medium underline">
          <RotateCcw size={14} /> Qayta urinish
        </button>
      )}
      <button type="button" onClick={onYop} aria-label="Yopish" className="p-1">
        <X size={16} />
      </button>
    </div>
  )
}

export function Kiritish({ onYubor, band }: { onYubor: (matn: string) => void; band: boolean }) {
  const [matn, setMatn] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [matn])

  const yubor = () => {
    if (band || !matn.trim()) return
    onYubor(matn)
    setMatn('')
  }
  const tugma = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      yubor()
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-lg border border-border bg-card p-1.5 focus-within:border-primary">
      <textarea
        ref={ref}
        rows={1}
        value={matn}
        onChange={(e) => setMatn(e.target.value)}
        onKeyDown={tugma}
        placeholder="Javobingizni yozing…"
        aria-label="Xabar"
        className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={yubor}
        aria-label="Yuborish"
        aria-busy={band}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-white disabled:opacity-50"
        disabled={band}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  )
}
