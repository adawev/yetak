import type { ArizaHolati, BankArizasiHolat, BankHisobi, Hukm, Papka, Profil } from '@shared/types'
import { ArrowLeft, Check, ChevronRight, Circle, Download, FolderOpen, Inbox, Loader2, RotateCcw, TriangleAlert } from 'lucide-react'
import { QAROR, QarorPanel, QarorYorliq } from '@/components/Qaror'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GarovBlok, HukmBlok, Karta, PulOqimiBlok, YolXaritasiBlok } from '@/components/bloklar'
import { api } from '@/lib/api'
import { qisqaSom, som, vaqt } from '@/lib/format'

const HUKM_YORLIQ: Record<Hukm, { matn: string; rang: string }> = {
  tayyor: { matn: 'Tayyor', rang: 'bg-success/15 text-success' },
  hali_emas: { matn: 'Hali emas', rang: 'bg-warning/15 text-warning' },
  olmang: { matn: 'Olmang', rang: 'bg-foreground/10 text-foreground' },
}

function HukmYorliq({ hukm }: { hukm: Hukm }) {
  const h = HUKM_YORLIQ[hukm]
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${h.rang}`}>{h.matn}</span>
}

/** Ma'lumotni yuklash: yuklanmoqda / xato / tayyor. */
function useYukla<T>(yukla: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [xato, setXato] = useState<string | null>(null)
  const qayta = useCallback(() => {
    setXato(null)
    yukla()
      .then(setData)
      .catch((e: unknown) => setXato(e instanceof Error ? e.message : 'Yuklab bo‘lmadi.'))
  }, [yukla])
  useEffect(() => {
    qayta()
  }, [qayta])
  return { data, xato, qayta }
}

function Hisob({ h }: { h: BankHisobi }) {
  const qatorlar: [string, string][] = [
    ['Arizalar', String(h.jami)],
    ['Kredit berildi', String(h.holatlar.berildi)],
    ['Berilgan summa', `${qisqaSom(h.berilgan_summa)} so'm`],
    [`Komissiya (${h.bank.komissiya_foiz}%)`, `${qisqaSom(h.komissiya)} so'm`],
  ]
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {qatorlar.map(([k, v]) => (
        <Karta key={k}>
          <p className="text-xs text-muted-foreground">{k}</p>
          <p className="font-display text-xl font-semibold tabular-nums">{v}</p>
        </Karta>
      ))}
    </div>
  )
}

const FILTR: (ArizaHolati | 'hammasi')[] = ['hammasi', 'yangi', 'korilmoqda', 'berildi', 'rad']

function Holat({ xato, onQayta }: { xato: string | null; onQayta: () => void }) {
  if (!xato) return <Loader2 className="mx-auto mt-10 animate-spin text-muted-foreground" />
  return (
    <div className="mt-10 space-y-3 text-center">
      <p>{xato}</p>
      <button type="button" onClick={onQayta} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border px-4">
        <RotateCcw size={16} /> Qayta urinish
      </button>
    </div>
  )
}

export default function Bank() {
  const { data, xato, qayta } = useYukla(api.arizalar)
  const hisob = useYukla(api.bankHisob)
  const [filtr, setFiltr] = useState<(typeof FILTR)[number]>('hammasi')
  const yangila = () => {
    qayta()
    hisob.qayta()
  }
  const royxat = (data ?? []).filter((a) => filtr === 'hammasi' || a.qaror.holat === filtr)

  return (
    <main className="mx-auto h-full max-w-4xl overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">{hisob.data?.bank.nom ?? 'Bank oynasi'}</h1>
          <p className="text-sm text-muted-foreground">Ma'lumotini ko'rsatishga rozilik bergan, tekshirilgan tadbirkorlar</p>
        </div>
        <button type="button" onClick={yangila} aria-label="Yangilash" title="Yangilash" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
          <RotateCcw size={17} />
        </button>
      </div>

      {hisob.data && <Hisob h={hisob.data} />}

      {!data ? (
        <Holat xato={xato} onQayta={qayta} />
      ) : (
        <>
          <div className="mb-3 flex gap-1 overflow-x-auto">
            {FILTR.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltr(f)}
                className={`min-h-9 shrink-0 rounded-full px-3 text-sm ${filtr === f ? 'bg-foreground text-background' : 'border border-border'}`}
              >
                {f === 'hammasi' ? 'Hammasi' : QAROR[f].matn}
                <span className="ml-1 tabular-nums opacity-70">
                  {f === 'hammasi' ? data.length : data.filter((a) => a.qaror.holat === f).length}
                </span>
              </button>
            ))}
          </div>
          {royxat.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
              <Inbox size={32} />
              <p>
                {data.length === 0
                  ? "Hozircha ariza yo'q. Tadbirkor chatda rozilik bergach, shu yerda chiqadi."
                  : "Bu holatda ariza yo'q."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {royxat.map((a) => (
                <li key={a.id}>
                  <Link to={`/bank/${a.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-foreground/5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.profil.faoliyat ?? 'Tadbirkor'}</p>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {a.profil.kredit_summa != null ? qisqaSom(a.profil.kredit_summa) + " so'm" : '—'} ·{' '}
                        {vaqt(a.yangilangan)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center">
                      <HukmYorliq hukm={a.natija.hukm} />
                      <QarorYorliq holat={a.qaror.holat} />
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}

const SHAKL: Record<NonNullable<Profil['shakl']>, string> = {
  yatt: 'YaTT',
  mchj: 'MChJ',
  ozini_band: "O'zini o'zi band qilgan",
  norasmiy: "Ro'yxatdan o'tmagan",
}
const TARIX: Record<NonNullable<Profil['kredit_tarixi']>, string> = {
  yaxshi: 'Yaxshi',
  yomon: 'Salbiy',
  yoq: "Kredit olmagan",
}
const haYoq = (b?: boolean) => (b == null ? '—' : b ? 'Ha' : "Yo'q")
const pul = (n?: number) => (n == null ? '—' : som(n))

function profilQatorlari(p: Profil): [string, string][] {
  return [
    ['Faoliyat', p.faoliyat ?? '—'],
    ['Shakl', p.shakl ? SHAKL[p.shakl] : '—'],
    ['Faoliyat muddati', p.faoliyat_oy != null ? `${p.faoliyat_oy} oy` : '—'],
    ['Oylik tushum', pul(p.oylik_tushum)],
    ['Oylik xarajat', pul(p.oylik_xarajat)],
    ['Kredit summasi', pul(p.kredit_summa)],
    ['Muddat', p.kredit_muddat_oy != null ? `${p.kredit_muddat_oy} oy` : '—'],
    ['Maqsad', p.maqsad ?? '—'],
    ['Garov qiymati', pul(p.garov_qiymati)],
    ['Kredit tarixi', p.kredit_tarixi ? TARIX[p.kredit_tarixi] : '—'],
    ['Avval mikrokredit', haYoq(p.avval_mikrokredit)],
    ['Elektron imzo', haYoq(p.eri_bor)],
  ]
}

function HujjatlarBolimi({ id, papka }: { id: string; papka: Papka }) {
  const [pdfXato, setPdfXato] = useState<string | null>(null)
  const olib = papka.hujjatlar.filter((h) => !h.bank_ozi_oladi)
  return (
    <Karta>
      <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <FolderOpen size={16} />
        Hujjatlar · {papka.mahsulot.bank}, {papka.mahsulot.nom}
      </p>
      <p className="mb-2 text-sm tabular-nums">
        Tayyor: {papka.tayyor} / {papka.jami}
      </p>
      {papka.ogohlantirishlar.length > 0 && (
        <ul className="mb-2 list-disc space-y-0.5 rounded-md bg-warning/10 py-2 pr-2 pl-6 text-sm text-warning">
          {papka.ogohlantirishlar.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      )}
      <ul className="space-y-1.5 text-sm">
        {olib.map((h) => {
          const t = h.fayl?.tekshiruv
          return (
            <li key={h.kalit} className="flex items-start gap-1.5">
              {!h.fayl ? (
                <Circle size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              ) : t?.holat === 'muammo' ? (
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warning" />
              ) : (
                <Check size={16} className={`mt-0.5 shrink-0 ${t ? 'text-success' : 'text-muted-foreground'}`} />
              )}
              <span className="min-w-0">
                {h.nom}
                <span className="block text-xs text-muted-foreground">
                  {!h.fayl ? (h.qoralama ? 'Qoralama papkada' : 'Yuklanmagan') : t ? (t.holat === 'mos' ? 'Yuklangan, tekshirilgan' : t.muammolar.join(' ') || 'Muammo bor') : 'Yuklangan, tekshirilmagan'}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={() => {
          setPdfXato(null)
          api.bankPapkaOch(id).catch((e: Error) => setPdfXato(e.message))
        }}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5"
      >
        <Download size={16} />
        Papkani ochish (PDF)
      </button>
      {pdfXato && <p className="mt-2 text-sm text-destructive">{pdfXato}</p>}
    </Karta>
  )
}

export function BankAriza() {
  const { id = '' } = useParams()
  const yukla = useCallback(() => api.ariza(id), [id])
  const { data, xato, qayta } = useYukla<BankArizasiHolat>(yukla)
  const [joriy, setJoriy] = useState<BankArizasiHolat | null>(null)
  const a = joriy ?? data

  return (
    <main className="mx-auto h-full max-w-4xl overflow-y-auto p-4">
      <Link to="/bank" className="mb-3 inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Arizalar
      </Link>
      {!a ? (
        <Holat xato={xato} onQayta={qayta} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{a.profil.faoliyat ?? 'Tadbirkor'}</h1>
              <HukmYorliq hukm={a.natija.hukm} />
            </div>
            <p className="text-sm text-muted-foreground">Yangilangan: {vaqt(a.yangilangan)}</p>
            <Karta>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
                {profilQatorlari(a.profil).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </Karta>
          </div>
          <div className="space-y-3">
            <QarorPanel ariza={a} onSaqlandi={setJoriy} />
            <HukmBlok natija={a.natija} />
            {a.profil.oylik_tushum != null && a.profil.oylik_xarajat != null && (
              <PulOqimiBlok
                tushum={a.profil.oylik_tushum}
                xarajat={a.profil.oylik_xarajat}
                foyda={a.natija.hisob.oylik_foyda}
                tolov={a.natija.hisob.oylik_tolov}
                stavka={a.natija.hisob.yillik_stavka}
              />
            )}
            {a.profil.garov_qiymati != null && (
              <GarovBlok bor={a.profil.garov_qiymati} kerak={a.natija.hisob.kerakli_garov} />
            )}
            {a.papka && <HujjatlarBolimi id={a.id} papka={a.papka} />}
            <YolXaritasiBlok qadamlar={a.natija.qadamlar} />
          </div>
        </div>
      )}
    </main>
  )
}
