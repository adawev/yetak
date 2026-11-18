// Bank xodimining qarori: ko'rib chiqilmoqda / kredit berildi / rad etildi.
// Komissiyani server hisoblaydi; bu yerda faqat ko'rsatiladi.
import type { ArizaHolati, BankArizasiHolat } from '@shared/types'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Karta } from '@/components/bloklar'
import { api } from '@/lib/api'
import { som, vaqt } from '@/lib/format'

export const QAROR: Record<ArizaHolati, { matn: string; rang: string }> = {
  yangi: { matn: 'Yangi', rang: 'bg-primary-soft text-primary' },
  korilmoqda: { matn: "Ko'rilmoqda", rang: 'bg-warning/15 text-warning' },
  berildi: { matn: 'Kredit berildi', rang: 'bg-success/15 text-success' },
  rad: { matn: 'Rad etildi', rang: 'bg-destructive/15 text-destructive' },
}

export function QarorYorliq({ holat }: { holat: ArizaHolati }) {
  const q = QAROR[holat]
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${q.rang}`}>{q.matn}</span>
}

const tugma = 'min-h-10 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50'
const maydon = 'mt-1 block min-h-10 w-full rounded-lg border border-border bg-card px-3 outline-none focus:border-primary'

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
    <Karta>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Bank qarori</p>
        <QarorYorliq holat={q.holat} />
      </div>

      {q.holat === 'berildi' && q.summa != null && (
        <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-success/10 p-2">
            <p className="text-xs text-muted-foreground">Berilgan summa</p>
            <p className="font-semibold tabular-nums">{som(q.summa)}</p>
          </div>
          <div className="rounded-md bg-primary-soft p-2">
            <p className="text-xs text-muted-foreground">Yetak komissiyasi</p>
            <p className="font-semibold tabular-nums">{som(q.komissiya ?? 0)}</p>
          </div>
        </div>
      )}
      {q.holat === 'rad' && q.sabab && <p className="mb-2 rounded-md bg-destructive/10 p-2 text-sm">Sabab: {q.sabab}</p>}
      {q.holat !== 'yangi' && <p className="mb-2 text-xs text-muted-foreground">Yangilangan: {vaqt(q.yangilangan)}</p>}

      {rejim === null && (
        <div className="flex flex-wrap gap-2">
          {q.holat === 'yangi' && (
            <button type="button" className={tugma} disabled={band} onClick={() => void saqla('korilmoqda')}>
              Ko'rib chiqyapman
            </button>
          )}
          <button type="button" className={`${tugma} text-success`} disabled={band} onClick={() => setRejim('berildi')}>
            Kredit berildi
          </button>
          <button type="button" className={`${tugma} text-destructive`} disabled={band} onClick={() => setRejim('rad')}>
            Rad etish
          </button>
        </div>
      )}

      {rejim === 'berildi' && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void saqla('berildi')
          }}
        >
          <label className="block text-sm">
            Berilgan summa, mln so'm
            <input className={maydon} inputMode="decimal" value={mln} onChange={(e) => setMln(e.target.value)} required />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={band} className="flex min-h-10 items-center gap-1 rounded-lg bg-success px-3 text-sm font-medium text-white">
              {band && <Loader2 size={14} className="animate-spin" />} Tasdiqlash
            </button>
            <button type="button" className={tugma} onClick={() => setRejim(null)}>
              Bekor
            </button>
          </div>
        </form>
      )}

      {rejim === 'rad' && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void saqla('rad')
          }}
        >
          <label className="block text-sm">
            Rad sababi — tadbirkor shunga qarab tuzatadi
            <textarea className={`${maydon} py-2`} rows={3} value={sabab} onChange={(e) => setSabab(e.target.value)} required />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={band} className="flex min-h-10 items-center gap-1 rounded-lg bg-destructive px-3 text-sm font-medium text-white">
              {band && <Loader2 size={14} className="animate-spin" />} Rad etish
            </button>
            <button type="button" className={tugma} onClick={() => setRejim(null)}>
              Bekor
            </button>
          </div>
        </form>
      )}

      {xato && <p className="mt-2 text-sm text-destructive">{xato}</p>}
    </Karta>
  )
}
