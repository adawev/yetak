// Chat ichidagi va yon paneldagi boy bloklar. Raqamlar serverdan keladi; bu yerda faqat chiziladi.
import type { Hukm, Natija, Qadam, Topilma } from '@shared/types'
import {
  AlertTriangle,
  BookOpen,
  ChartColumn,
  CheckCircle2,
  Circle,
  CircleX,
  Clock,
  ExternalLink,
  Route,
  Shield,
  ShieldCheck,
  Hand,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Blok } from '@/lib/bloklar'
import { foiz, qisqaSom, som } from '@/lib/format'

export function Karta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-card p-3 ${className}`}>{children}</div>
}

function Sarlavha({ belgi, children }: { belgi: ReactNode; children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
      {belgi}
      {children}
    </p>
  )
}

export function SummaBlok({ sarlavha, qiymat }: { sarlavha: string; qiymat: number }) {
  return (
    <Karta>
      <p className="text-sm text-muted-foreground">{sarlavha}</p>
      <p className="font-display text-2xl font-semibold tabular-nums">{som(qiymat)}</p>
    </Karta>
  )
}

export function PulOqimiBlok(p: { tushum: number; xarajat: number; foyda: number; tolov: number; stavka?: number }) {
  const eng = Math.max(p.tushum, p.xarajat, p.foyda, p.tolov, 1)
  const qatorlar = [
    { nom: 'Tushum', q: p.tushum, rang: 'bg-success/15 text-success' },
    { nom: 'Xarajat', q: p.xarajat, rang: 'bg-foreground/10 text-foreground' },
    { nom: 'Foyda', q: p.foyda, rang: 'bg-success/30 text-success' },
    { nom: "Kredit to'lovi", q: p.tolov, rang: 'bg-warning/20 text-warning' },
  ]
  return (
    <Karta>
      <Sarlavha belgi={<ChartColumn size={16} />}>Oylik pul oqimingiz</Sarlavha>
      <div className="space-y-1.5">
        {qatorlar.map((r) => (
          <div key={r.nom} className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2 text-sm">
            <span className="text-muted-foreground">{r.nom}</span>
            <div
              className={`flex h-6 items-center rounded px-2 text-xs font-medium tabular-nums whitespace-nowrap ${r.rang}`}
              style={{ width: `${Math.max(18, (r.q / eng) * 100)}%` }}
            >
              {qisqaSom(r.q)}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Oylik to'lov taxminiy{p.stavka ? `, yillik ${foiz(p.stavka)} stavka bilan` : ''}. Bank tasdiqlamagan.
      </p>
    </Karta>
  )
}

export function GarovBlok({ bor, kerak }: { bor: number; kerak: number }) {
  const eng = Math.max(bor, kerak, 1)
  return (
    <Karta>
      <Sarlavha belgi={<Shield size={16} />}>Garov</Sarlavha>
      <div className="relative h-3.5 overflow-hidden rounded-full bg-warning/20">
        <div className="h-full rounded-full bg-success" style={{ width: `${(bor / eng) * 100}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs tabular-nums">
        <span className="text-success">Sizda bor: {qisqaSom(bor)}</span>
        <span className="text-warning">Bank so'rashi mumkin: {qisqaSom(kerak)}</span>
      </div>
    </Karta>
  )
}

const HUKMLAR: Record<Hukm, { sarlavha: string; belgi: ReactNode; rang: string }> = {
  tayyor: {
    sarlavha: 'Ariza berishga tayyorsiz',
    belgi: <CheckCircle2 size={18} />,
    rang: 'border-success/50 bg-success/10 text-success',
  },
  hali_emas: {
    sarlavha: 'Hali tayyor emassiz',
    belgi: <Clock size={18} />,
    rang: 'border-warning/50 bg-warning/10 text-warning',
  },
  olmang: {
    sarlavha: 'Hozir qarz olmang',
    belgi: <Hand size={18} />,
    rang: 'border-foreground/30 bg-foreground/5 text-foreground',
  },
}

const DARAJA: Record<Topilma['daraja'], ReactNode> = {
  yaxshi: <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />,
  ogohlantirish: <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />,
  tosiq: <CircleX size={16} className="mt-0.5 shrink-0 text-destructive" />,
}

export function HukmBlok({ natija }: { natija: Natija }) {
  const h = HUKMLAR[natija.hukm]
  return (
    <div className={`rounded-lg border p-3 ${h.rang}`}>
      <p className="flex items-center gap-2 font-display text-lg font-semibold">
        {h.belgi}
        {h.sarlavha}
      </p>
      <p className="mt-1 text-sm opacity-90">{natija.xulosa}</p>
      {natija.topilmalar.length > 0 && (
        <ul className="mt-3 space-y-1.5 rounded-md bg-card p-2.5 text-sm text-foreground">
          {natija.topilmalar.map((t) => (
            <li key={t.kalit} className="flex gap-2">
              {DARAJA[t.daraja]}
              <span className="min-w-0">
                {t.matn}
                {t.taxmin && (
                  <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    taxmin
                  </span>
                )}
                {t.manba && (
                  <a
                    href={t.manba.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-muted-foreground underline"
                  >
                    {t.manba.nom}
                    <ExternalLink size={11} />
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function YolXaritasiBlok({
  qadamlar,
  onBelgila,
}: {
  qadamlar: Qadam[]
  onBelgila?: (kalit: string, bajarildi: boolean) => void
}) {
  const bajarilgan = qadamlar.filter((q) => q.bajarildi).length
  const keyingi = qadamlar.find((q) => !q.bajarildi)?.kalit
  return (
    <Karta>
      <Sarlavha belgi={<Route size={16} />}>
        Yo'l xaritangiz · {qadamlar.length} tadan {bajarilgan} tasi
      </Sarlavha>
      <ol className="ml-2 border-l-2 border-border">
        {qadamlar.map((q) => {
          const joriy = q.kalit === keyingi
          return (
            <li key={q.kalit} className="relative -ml-[11px] flex gap-2.5 pb-3 last:pb-0">
              <button
                type="button"
                disabled={!onBelgila}
                onClick={() => onBelgila?.(q.kalit, !q.bajarildi)}
                aria-label={q.bajarildi ? 'Bajarilmagan deb belgilash' : 'Bajarildi deb belgilash'}
                className="shrink-0 rounded-full bg-card disabled:cursor-default"
              >
                {q.bajarildi ? (
                  <CheckCircle2 size={20} className="text-success" />
                ) : (
                  <Circle size={20} className={joriy ? 'text-primary' : 'text-muted-foreground'} />
                )}
              </button>
              <div className="min-w-0 text-sm">
                <p
                  className={
                    q.bajarildi
                      ? 'text-muted-foreground line-through'
                      : joriy
                        ? 'font-semibold text-foreground'
                        : 'text-foreground'
                  }
                >
                  {q.sarlavha}
                </p>
                {!q.bajarildi && q.izoh && <p className="text-xs text-muted-foreground">{q.izoh}</p>}
                {q.manba && (
                  <a href={q.manba.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground underline">
                    {q.manba.nom}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Karta>
  )
}

export function AtamaBlok({ atama, izoh }: { atama: string; izoh: string }) {
  return (
    <div className="flex gap-2 rounded-lg bg-foreground/5 px-3 py-2 text-sm">
      <BookOpen size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
      <p>
        <span className="font-semibold">{atama}</span>
        <span className="text-muted-foreground"> — {izoh}</span>
      </p>
    </div>
  )
}

export function RozilikBlok({ rozi, onOzgartir }: { rozi: boolean; onOzgartir: (rozi: boolean) => void }) {
  return (
    <Karta>
      <Sarlavha belgi={<ShieldCheck size={16} />}>Bankka ko'rsatish</Sarlavha>
      <p className="text-sm">
        {rozi
          ? "Natijangiz bank xodimiga ko'rinadi. Istalgan payt bekor qilishingiz mumkin."
          : "Roziligingizsiz ma'lumotlaringiz hech kimga ko'rsatilmaydi."}
      </p>
      <button
        type="button"
        onClick={() => onOzgartir(!rozi)}
        className="mt-2 min-h-11 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5"
      >
        {rozi ? 'Roziligimni qaytarib olaman' : "Bankka ko'rsatishga roziman"}
      </button>
    </Karta>
  )
}

/** Xabar ichidagi bitta blokni chizadi. */
export function BlokKorsat({
  blok,
  natija,
  onBelgila,
}: {
  blok: Blok
  natija: Natija | null
  onBelgila?: (kalit: string, bajarildi: boolean) => void
}) {
  switch (blok.tur) {
    case 'summa':
      return <SummaBlok sarlavha={blok.sarlavha} qiymat={blok.qiymat} />
    case 'pul_oqimi':
      return <PulOqimiBlok {...blok} stavka={natija?.hisob.yillik_stavka} />
    case 'garov':
      return <GarovBlok bor={blok.bor} kerak={blok.kerak} />
    case 'hukm':
      return natija ? <HukmBlok natija={natija} /> : null
    case 'yol_xaritasi':
      return natija ? <YolXaritasiBlok qadamlar={natija.qadamlar} onBelgila={onBelgila} /> : null
    case 'atama':
      return <AtamaBlok atama={blok.atama} izoh={blok.izoh} />
  }
}
