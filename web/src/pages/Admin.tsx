// Admin panel: hisobot (voronka, hukmlar, kunlik, banklar) va hamkor banklarni boshqarish.
// Hamma raqamni server hisoblaydi; bu yerda faqat chiziladi.
import type { AdminHisobot, HamkorBank, Hukm, Shartnoma } from '@shared/types'
import { Building2, ChartColumn, Loader2, Plus, RotateCcw, UserPlus } from 'lucide-react'
import { SahifaSkelet } from '@/components/Skelet'
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { QAROR } from '@/components/Qaror'
import { Korsatkich, Korsatkichlar, SahifaSarlavha, Tablar, tugma } from '@/components/ui'
import { api } from '@/lib/api'
import { qisqaSom } from '@/lib/format'

const SHARTNOMA: Record<Shartnoma, { matn: string; rang: string }> = {
  faol: { matn: 'Faol', rang: 'bg-success/15 text-success' },
  muzokarada: { matn: 'Muzokarada', rang: 'bg-warning/15 text-warning' },
  toxtatilgan: { matn: "To'xtatilgan", rang: 'bg-foreground/10 text-muted-foreground' },
}
const HUKM: Record<Hukm, { matn: string; rang: string }> = {
  tayyor: { matn: 'Tayyor', rang: 'bg-success' },
  hali_emas: { matn: 'Hali emas', rang: 'bg-warning' },
  olmang: { matn: 'Hozir olmang', rang: 'bg-muted-foreground' },
}

const maydon = 'mt-1 block min-h-10 w-full rounded-lg border border-border bg-card px-3 outline-none focus:border-primary'
const xatoMatn = (e: unknown) => (e instanceof Error ? e.message : 'Nimadir xato ketdi.')

function Sarlavha({ children }: { belgi?: ReactNode; children: ReactNode }) {
  return <h2 className="mb-5 font-semibold">{children}</h2>
}

function Bolim({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-border bg-card p-5 ${className}`}>{children}</section>
}

function Hisobot({ h }: { h: AdminHisobot }) {
  const voronka: [string, number][] = [
    ['Suhbat boshlandi', h.suhbatlar.jami],
    ['Tekshiruv tugadi', h.suhbatlar.tugallangan],
    ['Bankka rozilik', h.suhbatlar.rozilik],
    ['Kredit berildi', h.jami.berilgan_kredit],
  ]
  const engKop = Math.max(1, ...voronka.map(([, n]) => n))
  const hukmJami = Math.max(1, h.suhbatlar.tugallangan)
  const kunEng = Math.max(1, ...h.kunlik.map((k) => k.soni))

  return (
    <div className="space-y-6">
      <Korsatkichlar>
        <Korsatkich nom="Tadbirkorlar" qiymat={h.foydalanuvchilar.tadbirkor} izoh="ro'yxatdan o'tgan" />
        <Korsatkich nom="Suhbatlar" qiymat={h.suhbatlar.jami} izoh={`${h.suhbatlar.tugallangan} tasi tekshiruvdan o'tgan`} />
        <Korsatkich nom="Berilgan kreditlar" qiymat={h.jami.berilgan_kredit} izoh={`${qisqaSom(h.jami.berilgan_summa)} so'm`} />
        <Korsatkich nom="Yetak daromadi" qiymat={`${qisqaSom(h.jami.daromad)} so'm`} izoh="banklar komissiyasi" />
      </Korsatkichlar>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bolim>
          <Sarlavha belgi={<ChartColumn size={18} />}>Voronka</Sarlavha>
          <div className="space-y-2">
            {voronka.map(([nom, n], i) => (
              <div key={nom} className="grid grid-cols-[120px_minmax(0,1fr)_44px] items-center gap-2 text-sm">
                <span className="text-muted-foreground">{nom}</span>
                <div
                  className={`flex h-7 items-center rounded px-2 text-xs font-semibold tabular-nums ${i === 3 ? 'bg-primary text-white' : 'bg-foreground text-background'}`}
                  style={{ width: `${Math.max(10, (n / engKop) * 100)}%` }}
                >
                  {n}
                </div>
                <span className="text-right text-xs text-muted-foreground tabular-nums">
                  {i === 0 ? '' : `${voronka[0][1] ? Math.round((n / voronka[0][1]) * 100) : 0}%`}
                </span>
              </div>
            ))}
          </div>
        </Bolim>

        <Bolim>
          <Sarlavha belgi={<ChartColumn size={18} />}>Hukmlar</Sarlavha>
          <div className="flex h-2 overflow-hidden rounded-full">
            {(Object.keys(HUKM) as Hukm[]).map((k) =>
              h.suhbatlar.hukmlar[k] ? (
                <div
                  key={k}
                  className={HUKM[k].rang}
                  style={{ width: `${(h.suhbatlar.hukmlar[k] / hukmJami) * 100}%` }}
                  title={`${HUKM[k].matn}: ${h.suhbatlar.hukmlar[k]}`}
                />
              ) : null,
            )}
            {h.suhbatlar.tugallangan === 0 && <div className="w-full bg-foreground/10" />}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {(Object.keys(HUKM) as Hukm[]).map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${HUKM[k].rang}`} />
                {HUKM[k].matn}: <b className="tabular-nums">{h.suhbatlar.hukmlar[k]}</b>
              </li>
            ))}
          </ul>

          <p className="mt-4 mb-1 text-sm text-muted-foreground">Yangi suhbatlar, oxirgi 7 kun</p>
          <div className="flex h-24 items-end gap-1.5">
            {h.kunlik.map((k) => (
              <div key={k.sana} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums">{k.soni || ''}</span>
                <div className="w-full rounded-t-sm bg-foreground/80" style={{ height: `${(k.soni / kunEng) * 64 + 2}px` }} />
                <span className="text-[10px] text-muted-foreground">{k.sana.slice(8)}.{k.sana.slice(5, 7)}</span>
              </div>
            ))}
          </div>
        </Bolim>
      </div>

      <Bolim className="overflow-x-auto">
        <Sarlavha belgi={<Building2 size={18} />}>Banklar bo'yicha</Sarlavha>
        {h.banklar.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hali hamkor bank yo'q. «Banklar» bo'limida qo'shing.</p>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 font-medium">Bank</th>
                <th className="font-medium">Shartnoma</th>
                {(['yangi', 'korilmoqda', 'berildi', 'rad'] as const).map((x) => (
                  <th key={x} className="text-right font-medium">
                    {QAROR[x].matn}
                  </th>
                ))}
                <th className="text-right font-medium">Berilgan</th>
                <th className="text-right font-medium">Komissiya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {h.banklar.map((b) => (
                <tr key={b.id}>
                  <td className="py-2 font-medium">{b.nom}</td>
                  <td>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${SHARTNOMA[b.shartnoma].rang}`}>
                      {SHARTNOMA[b.shartnoma].matn}
                    </span>
                  </td>
                  <td className="text-right">{b.holatlar.yangi}</td>
                  <td className="text-right">{b.holatlar.korilmoqda}</td>
                  <td className="text-right">{b.holatlar.berildi}</td>
                  <td className="text-right">{b.holatlar.rad}</td>
                  <td className="text-right">{qisqaSom(b.berilgan_summa)}</td>
                  <td className="text-right font-semibold">
                    {qisqaSom(b.komissiya)} <span className="text-xs font-normal text-muted-foreground">({b.komissiya_foiz}%)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Bolim>
    </div>
  )
}

function YangiBank({ onQoshildi }: { onQoshildi: () => void }) {
  const [nom, setNom] = useState('')
  const [foiz, setFoiz] = useState('1')
  const [shartnoma, setShartnoma] = useState<Shartnoma>('faol')
  const [band, setBand] = useState(false)
  const [xato, setXato] = useState<string | null>(null)

  const yubor = async (e: FormEvent) => {
    e.preventDefault()
    setBand(true)
    setXato(null)
    try {
      await api.bankYarat({ nom, shartnoma, komissiya_foiz: Number(foiz.replace(',', '.')) })
      setNom('')
      onQoshildi()
    } catch (e) {
      setXato(xatoMatn(e))
    } finally {
      setBand(false)
    }
  }

  return (
    <form onSubmit={yubor} className="rounded-lg border border-border bg-card p-3">
      <p className="mb-2 font-medium">Hamkor bank qo'shish</p>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <label className="text-sm">
          Nomi
          <input className={maydon} value={nom} onChange={(e) => setNom(e.target.value)} required />
        </label>
        <label className="text-sm">
          Komissiya, %
          <input className={maydon} inputMode="decimal" value={foiz} onChange={(e) => setFoiz(e.target.value)} required />
        </label>
        <label className="text-sm">
          Shartnoma
          <select className={maydon} value={shartnoma} onChange={(e) => setShartnoma(e.target.value as Shartnoma)}>
            {(Object.keys(SHARTNOMA) as Shartnoma[]).map((s) => (
              <option key={s} value={s}>
                {SHARTNOMA[s].matn}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={band} className="flex min-h-10 items-center justify-center gap-1 rounded-lg bg-foreground px-4 font-medium text-background">
          {band ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Qo'shish
        </button>
      </div>
      {xato && <p className="mt-2 text-sm text-destructive">{xato}</p>}
    </form>
  )
}

function BankKarta({ b, onYangi }: { b: HamkorBank; onYangi: (b: HamkorBank) => void }) {
  const [ochiq, setOchiq] = useState(false)
  const [ism, setIsm] = useState('')
  const [telefon, setTelefon] = useState('')
  const [parol, setParol] = useState('')
  const [xato, setXato] = useState<string | null>(null)
  const [band, setBand] = useState(false)

  const ozgartir = async (p: Partial<{ shartnoma: Shartnoma; komissiya_foiz: number }>) => {
    setXato(null)
    try {
      onYangi(await api.bankYangila(b.id, p))
    } catch (e) {
      setXato(xatoMatn(e))
    }
  }

  const xodim = async (e: FormEvent) => {
    e.preventDefault()
    setBand(true)
    setXato(null)
    try {
      onYangi(await api.xodimQosh(b.id, { ism, telefon, parol }))
      setIsm('')
      setTelefon('')
      setParol('')
      setOchiq(false)
    } catch (e) {
      setXato(xatoMatn(e))
    } finally {
      setBand(false)
    }
  }

  return (
    <li className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-lg font-semibold">{b.nom}</p>
        <select
          aria-label="Shartnoma holati"
          className="min-h-9 rounded-lg border border-border bg-card px-2 text-sm"
          value={b.shartnoma}
          onChange={(e) => void ozgartir({ shartnoma: e.target.value as Shartnoma })}
        >
          {(Object.keys(SHARTNOMA) as Shartnoma[]).map((s) => (
            <option key={s} value={s}>
              {SHARTNOMA[s].matn}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            aria-label="Komissiya foizi"
            key={b.komissiya_foiz}
            defaultValue={b.komissiya_foiz}
            inputMode="decimal"
            className="min-h-9 w-16 rounded-lg border border-border bg-card px-2 text-right"
            onBlur={(e) => {
              const v = Number(e.target.value.replace(',', '.'))
              if (v !== b.komissiya_foiz) void ozgartir({ komissiya_foiz: v })
            }}
          />
          %
        </label>
      </div>

      <div className="mt-2 text-sm">
        <p className="text-xs text-muted-foreground">Xodimlar</p>
        {b.xodimlar.length === 0 ? (
          <p className="text-muted-foreground">Hali xodim yo'q — bank oynasiga kirish uchun xodim oching.</p>
        ) : (
          <ul>
            {b.xodimlar.map((x) => (
              <li key={x.id} className="tabular-nums">
                {x.ism}, +{x.telefon}
              </li>
            ))}
          </ul>
        )}
      </div>

      {ochiq ? (
        <form onSubmit={xodim} className="mt-2 grid gap-2 sm:grid-cols-3">
          <input className={maydon} placeholder="Ism" value={ism} onChange={(e) => setIsm(e.target.value)} required />
          <input className={maydon} placeholder="Telefon" inputMode="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} required />
          <input
            className={maydon}
            placeholder="Parol (kamida 6)"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={parol}
            onChange={(e) => setParol(e.target.value)}
            required
          />
          <div className="flex gap-2 sm:col-span-3">
            <button type="submit" disabled={band} className="flex min-h-10 items-center gap-1 rounded-lg bg-foreground px-3 text-sm font-medium text-background">
              {band && <Loader2 size={14} className="animate-spin" />} Xodim ochish
            </button>
            <button type="button" className="min-h-10 rounded-lg border border-border px-3 text-sm" onClick={() => setOchiq(false)}>
              Bekor
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOchiq(true)}
          className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-medium underline underline-offset-2"
        >
          <UserPlus size={14} /> Xodim qo'shish
        </button>
      )}
      {xato && <p className="mt-2 text-sm text-destructive">{xato}</p>}
    </li>
  )
}

export default function Admin() {
  const [bolim, setBolim] = useState<'hisobot' | 'banklar'>('hisobot')
  const [hisobot, setHisobot] = useState<AdminHisobot | null>(null)
  const [banklar, setBanklar] = useState<HamkorBank[] | null>(null)
  const [xato, setXato] = useState<string | null>(null)

  const yukla = useCallback(() => {
    setXato(null)
    Promise.all([api.hisobot(), api.banklar()])
      .then(([h, b]) => {
        setHisobot(h)
        setBanklar(b)
      })
      .catch((e: unknown) => setXato(xatoMatn(e)))
  }, [])

  useEffect(() => {
    yukla()
  }, [yukla])

  return (
    <main className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <SahifaSarlavha
        nom="Boshqaruv"
        izoh="Tadbirkor uchun bepul. Daromad — hamkor banklar komissiyasi."
        amal={
          <button type="button" onClick={yukla} className={tugma.sokin}>
            <RotateCcw size={15} /> Yangilash
          </button>
        }
      />

      <div className="mb-8">
        <Tablar
          qiymat={bolim}
          onTanla={setBolim}
          royxat={[
            { kalit: 'hisobot', nom: 'Hisobot' },
            { kalit: 'banklar', nom: 'Hamkor banklar', soni: banklar?.length },
          ]}
        />
      </div>

      {xato && <p className="mb-3 rounded-lg bg-destructive/10 p-3 text-destructive">{xato}</p>}
      {!hisobot || !banklar ? (
        !xato && <SahifaSkelet />
      ) : bolim === 'hisobot' ? (
        <Hisobot h={hisobot} />
      ) : (
        <div className="space-y-3">
          <YangiBank onQoshildi={yukla} />
          <ul className="space-y-2">
            {banklar.map((b) => (
              <BankKarta key={b.id} b={b} onYangi={(y) => setBanklar(banklar.map((x) => (x.id === y.id ? y : x)))} />
            ))}
          </ul>
        </div>
      )}
      </div>
    </main>
  )
}
