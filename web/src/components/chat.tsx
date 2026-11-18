import type { Natija, Papka } from '@shared/types'
import { AlertCircle, ArrowUp, Image as RasmIkon, ImagePlus, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { TahlilKutish } from '@/components/BankKartalar'
import { BlokKorsat, type ChatImkon } from '@/components/bloklar'
import { ManbaChiplari } from '@/components/Manbalar'
import { Matn } from '@/components/Matn'
import { rasmmi } from '@/lib/rasm'
import type { BoyXabar } from '@/lib/bloklar'

/** Yetak belgisi — agent xabarlari yonida. */
export function YetakAvatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-card" aria-hidden>
      <picture>
        <source srcSet="/yetak-mark-dark.svg" media="(prefers-color-scheme: dark)" />
        <img src="/yetak-mark.svg" alt="" className="h-4 w-4" />
      </picture>
    </span>
  )
}

export function XabarPufak({
  xabar,
  natija,
  papka,
  onBelgila,
  holati,
  rasmUrl,
  chat,
}: {
  xabar: Pick<BoyXabar, 'kim' | 'matn' | 'bloklar' | 'manbalar' | 'rasm'>
  natija: Natija | null
  papka?: Papka | null
  onBelgila?: (kalit: string, bajarildi: boolean) => void
  holati?: 'yuborilmoqda' | 'yuborilmadi'
  rasmUrl?: string | null
  chat?: ChatImkon
}) {
  if (xabar.kim === 'tadbirkor') {
    return (
      <div className="flex flex-col items-end">
        <div
          className={`max-w-[80%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 whitespace-pre-wrap text-background ${holati ? 'opacity-70' : ''}`}
        >
          {rasmUrl && <img src={rasmUrl} alt="" className="mb-1 max-h-40 rounded-md" />}
          {xabar.matn}
        </div>
        {xabar.rasm && !rasmUrl && (
          <span className="mt-1 flex items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground">
            <RasmIkon size={12} /> Rasm yuborildi
          </span>
        )}
        {holati === 'yuborilmadi' && <span className="mt-1 text-xs text-destructive">Yuborilmadi</span>}
      </div>
    )
  }
  return (
    <div className="flex gap-2.5">
      <YetakAvatar />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:max-w-[85%]">
        {xabar.matn && (
          <div className="w-fit max-w-full rounded-2xl rounded-tl-md bg-surface px-4 py-2.5">
            <Matn matn={xabar.matn} />
          </div>
        )}
        {xabar.bloklar?.map((b, i) => (
          <BlokKorsat key={i} blok={b} natija={natija} papka={papka} onBelgila={onBelgila} chat={chat} />
        ))}
        {xabar.manbalar && <ManbaChiplari manbalar={xabar.manbalar} />}
      </div>
    </div>
  )
}

/** Agent javobini kutish. `tahlil` — oxirgi savoldan keyin: banklarni qidirish animatsiyasi. */
export function Kutish({ tahlil = false }: { tahlil?: boolean }) {
  const [soniya, setSoniya] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSoniya((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  if (tahlil) {
    return (
      <div className="flex gap-2.5">
        <YetakAvatar />
        <div className="min-w-0 flex-1 sm:max-w-[85%]">
          <TahlilKutish />
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground" role="status">
      <YetakAvatar />
      <span className="flex gap-1 rounded-2xl rounded-tl-md bg-surface px-4 py-3.5">
        {[0, 150, 300].map((d) => (
          <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />
        ))}
      </span>
      {soniya >= 10 && <span>Biroz kuting…</span>}
    </div>
  )
}

export function Tugmalar({ tugmalar, onTanla }: { tugmalar: string[]; onTanla: (t: string) => void }) {
  if (!tugmalar.length) return null
  return (
    <div className="kirish flex flex-wrap gap-2 pl-[42px]">
      {tugmalar.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTanla(t)}
          className="min-h-11 rounded-full border border-primary/40 bg-card px-4 text-sm font-medium text-primary hover:bg-primary-soft"
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

export function Kiritish({
  onYubor,
  band,
}: {
  onYubor: (matn: string, fayl?: File) => void
  band: boolean
}) {
  const [matn, setMatn] = useState('')
  const [fayl, setFayl] = useState<File | null>(null)
  const [kichik, setKichik] = useState<string | null>(null)
  const [xato, setXato] = useState<string | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)
  const tanlash = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [matn])

  useEffect(() => {
    if (!fayl) {
      setKichik(null)
      return
    }
    const u = URL.createObjectURL(fayl)
    setKichik(u)
    return () => URL.revokeObjectURL(u)
  }, [fayl])

  const tanla = (f?: File) => {
    if (!f) return
    if (!rasmmi(f)) {
      setXato("Bu yerga faqat rasm (skrinshot) yuboring.")
      return
    }
    setXato(null)
    setFayl(f)
  }

  const yubor = () => {
    if (band || (!matn.trim() && !fayl)) return
    onYubor(matn, fayl ?? undefined)
    setMatn('')
    setFayl(null)
  }
  const tugma = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      yubor()
    }
  }

  return (
    <div className="space-y-1.5">
      {xato && <p className="text-xs text-destructive">{xato}</p>}
      {kichik && (
        <div className="relative inline-block">
          <img src={kichik} alt="Tanlangan rasm" className="h-16 w-16 rounded-md border border-border object-cover" />
          <button
            type="button"
            onClick={() => setFayl(null)}
            aria-label="Rasmni olib tashlash"
            className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-foreground text-background"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-lg border border-border bg-card p-1.5 focus-within:border-primary">
        <input
          ref={tanlash}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            tanla(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => tanlash.current?.click()}
          aria-label="Rasm qo'shish"
          disabled={band}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 disabled:opacity-50"
        >
          <ImagePlus size={20} />
        </button>
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
    </div>
  )
}
