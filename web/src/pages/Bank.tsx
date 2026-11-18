import type { BankArizasi, Hukm, Profil } from '@shared/types'
import { ArrowLeft, Check, ChevronRight, Circle, Download, FolderOpen, Inbox, Loader2, RotateCcw, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GarovBlok, HukmBlok, Karta, PulOqimiBlok, YolXaritasiBlok } from '@/components/bloklar'
import { api, bankPapkaPdfUrl } from '@/lib/api'
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

  return (
    <main className="mx-auto h-full max-w-4xl overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Bank oynasi</h1>
          <p className="text-sm text-muted-foreground">Ma'lumotini ko'rsatishga rozilik bergan tadbirkorlar</p>
        </div>
        <button type="button" onClick={qayta} className="flex min-h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm">
          <RotateCcw size={14} /> Yangilash
        </button>
      </div>

      {!data ? (
        <Holat xato={xato} onQayta={qayta} />
      ) : data.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <Inbox size={32} />
          <p>Hozircha ariza yo'q. Tadbirkor chatda rozilik bergach, shu yerda chiqadi.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {[...data]
            .sort((a, b) => b.yangilangan.localeCompare(a.yangilangan))
            .map((a) => (
              <li key={a.id}>
                <Link to={`/bank/${a.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-foreground/5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{a.profil.faoliyat ?? 'Tadbirkor'}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {a.profil.kredit_summa != null ? qisqaSom(a.profil.kredit_summa) + " so'm" : '—'} ·{' '}
                      {vaqt(a.yangilangan)}
                    </p>
                  </div>
                  <HukmYorliq hukm={a.natija.hukm} />
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
        </ul>
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

function HujjatlarBolimi({ id, papka }: { id: string; papka: NonNullable<BankArizasi['papka']> }) {
  const yuklangan = papka.hujjatlar.some((h) => h.fayl)
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
      {yuklangan && (
        <a
          href={bankPapkaPdfUrl(id)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-foreground/5"
        >
          <Download size={16} />
          Papkani ochish (PDF)
        </a>
      )}
    </Karta>
  )
}

export function BankAriza() {
  const { id = '' } = useParams()
  const yukla = useCallback(() => api.ariza(id), [id])
  const { data, xato, qayta } = useYukla<BankArizasi>(yukla)

  return (
    <main className="mx-auto h-full max-w-4xl overflow-y-auto p-4">
      <Link to="/bank" className="mb-3 inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Arizalar
      </Link>
      {!data ? (
        <Holat xato={xato} onQayta={qayta} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{data.profil.faoliyat ?? 'Tadbirkor'}</h1>
              <HukmYorliq hukm={data.natija.hukm} />
            </div>
            <p className="text-sm text-muted-foreground">Yangilangan: {vaqt(data.yangilangan)}</p>
            <Karta>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
                {profilQatorlari(data.profil).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </Karta>
          </div>
          <div className="space-y-3">
            <HukmBlok natija={data.natija} />
            {data.profil.oylik_tushum != null && data.profil.oylik_xarajat != null && (
              <PulOqimiBlok
                tushum={data.profil.oylik_tushum}
                xarajat={data.profil.oylik_xarajat}
                foyda={data.natija.hisob.oylik_foyda}
                tolov={data.natija.hisob.oylik_tolov}
                stavka={data.natija.hisob.yillik_stavka}
              />
            )}
            {data.profil.garov_qiymati != null && (
              <GarovBlok bor={data.profil.garov_qiymati} kerak={data.natija.hisob.kerakli_garov} />
            )}
            {data.papka && <HujjatlarBolimi id={data.id} papka={data.papka} />}
            <YolXaritasiBlok qadamlar={data.natija.qadamlar} />
          </div>
        </div>
      )}
    </main>
  )
}
