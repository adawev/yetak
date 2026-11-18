import type { MahsulotMoslik, ShartHolati } from '@shared/types'
import { Check, ChevronDown, CircleHelp, ExternalLink, Landmark, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'

const MOS: Record<MahsulotMoslik['mos'], { matn: string; rang: string }> = {
  mos: { matn: 'Mos', rang: 'bg-success/15 text-success' },
  qisman: { matn: 'Aniqlash kerak', rang: 'bg-warning/15 text-warning' },
  mos_emas: { matn: 'Mos emas', rang: 'bg-foreground/10 text-muted-foreground' },
}

const BELGI: Record<ShartHolati, ReactNode> = {
  ha: <Check size={14} className="mt-0.5 shrink-0 text-success" />,
  yoq: <X size={14} className="mt-0.5 shrink-0 text-destructive" />,
  nomalum: <CircleHelp size={14} className="mt-0.5 shrink-0 text-warning" />,
}

function Mahsulot({ m, ochiqBoshla }: { m: MahsulotMoslik; ochiqBoshla: boolean }) {
  const [ochiq, setOchiq] = useState(false)
  const muammo = m.shartlar.filter((s) => s.holat !== 'ha')
  const bajarilgan = m.shartlar.length - muammo.length
  const yopiq = m.mos === 'mos_emas' && !ochiqBoshla && !ochiq

  return (
    <li className={`rounded-lg border border-border bg-card p-3 ${m.mos === 'mos_emas' ? 'opacity-80' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{m.bank}</p>
          <p className="text-sm">{m.nom}</p>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{m.qisqa}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${MOS[m.mos].rang}`}>{MOS[m.mos].matn}</span>
      </div>

      {!yopiq && (
        <ul className="mt-2 space-y-1 text-sm">
          {(ochiq ? m.shartlar : muammo).map((s) => (
            <li key={s.matn} className="flex gap-1.5">
              {BELGI[s.holat]}
              <span className="min-w-0">{s.matn}</span>
            </li>
          ))}
          {!ochiq && bajarilgan > 0 && (
            <li className="flex gap-1.5 text-muted-foreground">
              {BELGI.ha}
              {bajarilgan} ta shart bajarilgan
            </li>
          )}
        </ul>
      )}

      {ochiq && (
        <div className="mt-2 border-t border-border pt-2 text-sm">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Siz olib borasiz</p>
          <ul className="list-disc space-y-0.5 pl-5">
            {m.hujjatlar.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          {m.bank_tekshiradi.length > 0 && (
            <>
              <p className="mt-2 mb-1 text-xs font-medium text-muted-foreground">Bank o'zi tekshiradi — olib bormaysiz</p>
              <ul className="space-y-0.5">
                {m.bank_tekshiradi.map((h) => (
                  <li key={h} className="flex gap-1.5">
                    {BELGI.ha}
                    <span className="min-w-0">{h}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <a
            href={m.manba.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground underline"
          >
            {m.manba.nom} <ExternalLink size={11} />
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOchiq(!ochiq)}
        aria-expanded={ochiq}
        className="mt-1.5 inline-flex min-h-8 items-center gap-1 text-xs font-medium underline underline-offset-2"
      >
        {ochiq ? 'Qisqaroq' : yopiq ? 'Nega mos emas' : 'Hujjatlar va shartlar'}
        <ChevronDown size={14} className={ochiq ? 'rotate-180' : ''} />
      </button>
    </li>
  )
}

/** Tekshirilgan bank mahsulotlari: har shart ✓ / ✗ / ?. Eng mosi birinchi. */
export function MahsulotlarBlok({ mahsulotlar }: { mahsulotlar: MahsulotMoslik[] }) {
  if (!mahsulotlar.length) return null
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Landmark size={16} />
        Sizga mos bank mahsulotlari
      </p>
      <ul className="space-y-2">
        {mahsulotlar.map((m, i) => (
          <Mahsulot key={m.kalit} m={m} ochiqBoshla={i === 0} />
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Shartlar bank sahifalaridan 18.11 da tekshirilgan, o'zgarishi mumkin. Qarorni bank qiladi.
      </p>
    </div>
  )
}
