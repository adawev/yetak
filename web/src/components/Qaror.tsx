// Bank xodimining qarori: ko'rib chiqilmoqda / kredit berildi / rad etildi.
// Komissiyani server hisoblaydi; bu yerda faqat ko'rsatiladi.
import type { ArizaHolati, BankArizasiHolat } from '@shared/types'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Nuqta, tugma as T, maydon as M, type Ton } from '@/components/ui'
import { api } from '@/lib/api'
import { som, vaqt } from '@/lib/format'

export const QAROR: Record<ArizaHolati, { matn: string; ton: Ton }> = {
  yangi: { matn: 'Yangi', ton: 'primary' },
  korilmoqda: { matn: "Ko'rilmoqda", ton: 'warning' },
  berildi: { matn: 'Kredit berildi', ton: 'success' },
  rad: { matn: 'Rad etildi', ton: 'destructive' },
}

export function QarorYorliq({ holat }: { holat: ArizaHolati }) {
  const q = QAROR[holat]
  return <Nuqta ton={q.ton}>{q.matn}</Nuqta>
}


export function QarorPanel({
  ariza,
  onSaqlandi,
}: {
  ariza: BankArizasiHolat
  onSaqlandi: (a: BankArizasiHolat) => void
}) {
  const q = ariza.qaror
  const [rejim, setRejim] = useState<'berildi' | 'rad' | null>(null)
  const [mln, setMln] = useState(() =>
    ariza.profil.kredit_summa != null ? String(ariza.profil.kredit_summa / 1_000_000) : '',
  )
  const [sabab, setSabab] = useState('')
  const [band, setBand] = useState(false)
  const [xato, setXato] = useState<string | null>(null)

  const saqla = async (holat: ArizaHolati) => {
    setBand(true)
    setXato(null)
    try {
      const p =
        holat === 'berildi'
          ? { holat, summa: Number(mln.replace(',', '.')) * 1_000_000 }
          : holat === 'rad'
            ? { holat, sabab }
            : { holat }
      onSaqlandi(await api.qaror(ariza.id, p))
      setRejim(null)
    } catch (e) {
      setXato(e instanceof Error ? e.message : 'Saqlab bo‘lmadi.')
    } finally {
      setBand(false)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <h2 className="font-semibold">Bank qarori</h2>
        <QarorYorliq holat={q.holat} />
      </div>
      <div className="p-5">
        {q.holat === 'berildi' && q.summa != null && (
          <dl className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Berilgan summa</dt>
              <dd className="font-semibold tabular-nums">{som(q.summa)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Yetak komissiyasi</dt>
              <dd className="font-semibold tabular-nums">{som(q.komissiya ?? 0)}</dd>
            </div>
          </dl>
        )}
        {q.holat === 'rad' && q.sabab && (
          <p className="mb-4 border-l-2 border-destructive pl-3 text-sm">
            <span className="text-muted-foreground">Sabab: </span>
            {q.sabab}
          </p>
        )}

        {rejim === null && (
          <div className="grid gap-2">
            <button type="button" className={T.asosiy} disabled={band} onClick={() => setRejim('berildi')}>
              Kredit berildi
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={T.ikkinchi}
                disabled={band || q.holat === 'korilmoqda'}
                onClick={() => void saqla('korilmoqda')}
              >
                Ko'rib chiqish
              </button>
              <button type="button" className={T.ikkinchi} disabled={band} onClick={() => setRejim('rad')}>
                Rad etish
              </button>
            </div>
          </div>
        )}

        {rejim === 'berildi' && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              void saqla('berildi')
            }}
          >
            <label className="block text-sm font-medium">
              Berilgan summa, mln so'm
              <input className={`${M} mt-1.5`} inputMode="decimal" value={mln} onChange={(e) => setMln(e.target.value)} required />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={T.ikkinchi} onClick={() => setRejim(null)}>
                Bekor
              </button>
              <button type="submit" disabled={band} className={T.asosiy}>
                {band && <Loader2 size={16} className="animate-spin" />} Tasdiqlash
              </button>
            </div>
          </form>
        )}

        {rejim === 'rad' && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              void saqla('rad')
            }}
          >
            <label className="block text-sm font-medium">
              Rad sababi
              <textarea className={`${M} mt-1.5 py-2`} rows={3} value={sabab} onChange={(e) => setSabab(e.target.value)} required />
              <span className="mt-1 block text-sm font-normal text-muted-foreground">Tadbirkor shunga qarab tuzatadi.</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={T.ikkinchi} onClick={() => setRejim(null)}>
                Bekor
              </button>
              <button type="submit" disabled={band} className={T.asosiy}>
                {band && <Loader2 size={16} className="animate-spin" />} Rad etish
              </button>
            </div>
          </form>
        )}

        {q.holat !== 'yangi' && <p className="mt-4 text-sm text-muted-foreground">Yangilangan {vaqt(q.yangilangan)}</p>}
        {xato && <p className="mt-3 text-sm text-destructive">{xato}</p>}
      </div>
    </section>
  )
}
