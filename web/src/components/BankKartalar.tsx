// Chatdagi banklar: avval qisqa «ko'rib chiqyapmiz» animatsiyasi, keyin 2–3 ta logotipli bank kartasi.
// Raqamlar serverdan (mahsulotlar.ts) — bu yerda faqat chiziladi.
import type { MahsulotMoslik, ShartHolati } from '@shared/types'
import { Check, ChevronDown, CircleHelp, ExternalLink, Loader2, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { bankBelgisi } from '@/lib/banklar'
import { qisqaSom } from '@/lib/format'

export function BankLogo({ bank, olcham = 40 }: { bank: string; olcham?: number }) {
  const b = bankBelgisi(bank)
  const [xato, setXato] = useState(false)
  const uslub = { width: olcham, height: olcham }
  if (!b.logo || xato) {
    return (
      <span
        className="grid shrink-0 place-items-center rounded-xl font-bold text-white"
        style={{ ...uslub, background: b.rang, fontSize: olcham * 0.45 }}
        aria-hidden
      >
        {b.harf}
      </span>
    )
  }
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white" style={uslub}>
      <img src={b.logo} alt="" loading="lazy" decoding="async" className="h-[70%] w-[70%] object-contain" onError={() => setXato(true)} />
    </span>
  )
}

const BELGI: Record<ShartHolati, ReactNode> = {
  ha: <Check size={14} className="mt-0.5 shrink-0 text-success" />,
  yoq: <X size={14} className="mt-0.5 shrink-0 text-destructive" />,
  nomalum: <CircleHelp size={14} className="mt-0.5 shrink-0 text-warning" />,
}

function Raqam({ nom, qiymat, urgu }: { nom: string; qiymat: string; urgu?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{nom}</p>
      <p className={`font-semibold tabular-nums ${urgu ? 'text-lg text-foreground' : 'text-base'}`}>{qiymat}</p>
    </div>
  )
}

function BankKarta({
  m,
  eng,
  tanlangan,
  onTanla,
  kechikish,
}: {
  m: MahsulotMoslik
  eng: boolean
  tanlangan: boolean
  onTanla?: (matn: string) => void
  kechikish: number
}) {
  const [ochiq, setOchiq] = useState(false)
  const t = m.taklif!
  const foiz = t.foiz_min === t.foiz_max ? `${t.foiz_max}%` : `${t.foiz_min}–${t.foiz_max}%`
  const muammo = m.shartlar.filter((s) => s.holat !== 'ha')
  const bajarilgan = m.shartlar.length - muammo.length

  return (
    <li
      className={`kirish rounded-2xl border bg-card p-4 ${tanlangan ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
      style={{ animationDelay: `${kechikish}ms` }}
    >
      <div className="flex items-center gap-3">
        <BankLogo bank={m.bank} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{m.bank}</p>
          <p className="truncate text-sm text-muted-foreground">{m.nom}</p>
        </div>
        {tanlangan ? (
          <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white">Tanlandi</span>
        ) : eng && (t.foyda_ulushi == null || t.foyda_ulushi <= 50) ? (
          <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Eng qulay</span>
        ) : null}
      </div>

      <div className="mt-3 rounded-xl bg-surface p-3">
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{qisqaSom(t.summa)}</span> so'm ·{' '}
          <span className="font-semibold tabular-nums">{t.muddat_oy} oyga</span>
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Raqam nom="Oyiga to'lov" qiymat={`~${qisqaSom(t.oylik_tolov)}${t.oylik_tolov < 1e6 ? " so'm" : ''}`} urgu />
          <Raqam nom="Yillik foiz" qiymat={foiz} urgu />
        </div>
        {t.foyda_ulushi != null && (
          <p className={`mt-2 text-xs ${t.foyda_ulushi > 50 ? 'font-medium text-warning' : 'text-muted-foreground'}`}>
            To'lov oylik foydangizning {t.foyda_ulushi}% i
            {t.foyda_ulushi > 50 ? " — og'ir: savdo pasaysa, to'lash qiyin bo'ladi. Kamroq summa yoki uzoqroq muddatni ko'ring." : ''}
          </p>
        )}
        {t.izoh && <p className="mt-2 text-xs text-muted-foreground">{t.izoh}</p>}
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {(ochiq ? m.shartlar : muammo.slice(0, 2)).map((s) => (
          <li key={s.matn} className="flex gap-1.5">
            {BELGI[s.holat]}
            <span className="min-w-0">{s.matn}</span>
          </li>
        ))}
        {!ochiq && bajarilgan > 0 && (
          <li className="flex gap-1.5 text-muted-foreground">
            {BELGI.ha}
            {bajarilgan} ta talabga mos kelasiz
          </li>
        )}
      </ul>

      {ochiq && (
        <div className="mt-3 border-t border-border pt-2 text-sm">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Bank so'raydigan hujjatlar</p>
          <ul className="list-disc space-y-0.5 pl-5">
            {m.hujjatlar.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
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
        className="mt-1 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
      >
        {ochiq ? 'Yopish' : 'Talablar va hujjatlar'}
        <ChevronDown size={16} className={ochiq ? 'rotate-180' : ''} />
      </button>

      {onTanla && !tanlangan && (
        <button
          type="button"
          onClick={() => onTanla(m.bank)}
          className="mt-2 min-h-12 w-full rounded-xl bg-primary px-4 text-[15px] font-semibold text-white hover:opacity-90"
        >
          Shu bank bilan davom etish
        </button>
      )}
    </li>
  )
}

const TAHLIL = ["Biznesingiz ma'lumotlari", 'Banklar shartlari bilan solishtirish', "Oylik to'lovni hisoblash"]

/** «Ko'rib chiqyapmiz» — har qadam navbat bilan belgilanadi. Kutish paytida ham, natija kelganda ham ishlatiladi. */
export function Tahlil({ qadam, bankSoni }: { qadam: number; bankSoni?: number }) {
  return (
    <div className="kirish rounded-2xl border border-border bg-card p-4" role="status">
      <p className="font-semibold">Biznesingizni ko'rib chiqyapmiz</p>
      <p className="text-sm text-muted-foreground">Sizga eng qulay bankni topyapmiz…</p>
      <ul className="mt-3 space-y-2 text-sm">
        {TAHLIL.map((n, i) => (
          <li key={n} className={`flex items-center gap-2 ${i > qadam ? 'text-muted-foreground/60' : ''}`}>
            {i < qadam ? (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-success text-white">
                <Check size={12} strokeWidth={3} />
              </span>
            ) : i === qadam ? (
              <Loader2 size={20} className="animate-spin text-primary" />
            ) : (
              <span className="h-5 w-5 rounded-full border-2 border-border" />
            )}
            {i === 1 && bankSoni ? `${bankSoni} ta bank shartlari bilan solishtirish` : n}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Kutish paytidagi tahlil: qadamlar o'zi navbat bilan o'tadi, oxirgisida to'xtaydi. */
export function TahlilKutish() {
  const [q, setQ] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setQ((x) => Math.min(x + 1, TAHLIL.length - 1)), 1400)
    return () => clearInterval(t)
  }, [])
  return <Tahlil qadam={q} />
}

/** Chatdagi bank tanlovi: eng mos 2–3 bank. `yangi` — hozir kelgan bo'lsa, avval qisqa tahlil animatsiyasi. */
export function BankKartalar({
  mahsulotlar,
  tanlangan,
  onTanla,
  yangi,
}: {
  mahsulotlar: MahsulotMoslik[]
  tanlangan?: string | null
  onTanla?: (matn: string) => void
  yangi?: boolean
}) {
  const [qadam, setQadam] = useState(yangi ? 0 : TAHLIL.length)
  useEffect(() => {
    if (qadam >= TAHLIL.length) return
    const t = setTimeout(() => setQadam((x) => x + 1), 700)
    return () => clearTimeout(t)
  }, [qadam])

  const eng = mahsulotlar.filter((m) => m.taklif && m.mos !== 'mos_emas').slice(0, 3)
  const qolgan = mahsulotlar.filter((m) => !eng.includes(m))
  const [boshqa, setBoshqa] = useState(false)

  if (qadam < TAHLIL.length) return <Tahlil qadam={qadam} bankSoni={mahsulotlar.length} />

  if (!eng.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        Hozircha sizga mos bank topilmadi. Nimani tuzatish kerakligini «Reja» bo'limida ko'ring.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {eng.map((m, i) => (
          <BankKarta
            key={m.kalit}
            m={m}
            eng={i === 0}
            tanlangan={tanlangan === m.kalit}
            onTanla={onTanla}
            kechikish={yangi ? i * 120 : 0}
          />
        ))}
      </ul>
      <p className="px-1 text-xs text-muted-foreground">
        Oylik to'lov — taxminiy, yuqori foiz bilan hisoblangan. Shartlar bank saytlaridan 18.11 da olingan. Qarorni bank qiladi.
      </p>
      {qolgan.length > 0 && (
        <div className="px-1">
          <button
            type="button"
            onClick={() => setBoshqa(!boshqa)}
            className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-muted-foreground"
          >
            Boshqa banklar ({qolgan.length}) — nega mos emas
            <ChevronDown size={16} className={boshqa ? 'rotate-180' : ''} />
          </button>
          {boshqa && (
            <ul className="mt-1 space-y-2">
              {qolgan.map((m) => (
                <li key={m.kalit} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3 text-sm">
                  <BankLogo bank={m.bank} olcham={28} />
                  <div className="min-w-0">
                    <p className="font-medium">
                      {m.bank} <span className="font-normal text-muted-foreground">· {m.nom}</span>
                    </p>
                    {m.shartlar
                      .filter((s) => s.holat === 'yoq')
                      .slice(0, 2)
                      .map((s) => (
                        <p key={s.matn} className="flex gap-1.5 text-muted-foreground">
                          {BELGI.yoq}
                          {s.matn}
                        </p>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
