// Bank oynasi: rozilik bergan, tekshirilgan tadbirkorlar. Raqamlar serverdan (rules.ts va kabinet.ts).
// Bu yerda faqat ko'rsatish uchun nisbatlar: foyda ÷ to'lov va garov ÷ kerakli garov.
import { SHAKL_QISQA, yuridikShaxs, type ArizaHolati, type BankArizasiHolat, type BankHisobi, type Hukm, type Papka, type Profil } from '@shared/types'
import { ArrowLeft, Check, ChevronRight, Circle, Download, Inbox, RotateCcw, TriangleAlert } from 'lucide-react'
import { SahifaSkelet } from '@/components/Skelet'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GarovBlok, HukmBlok, PulOqimiBlok, YolXaritasiBlok } from '@/components/bloklar'
import { QAROR, QarorPanel, QarorYorliq } from '@/components/Qaror'
import { Korsatkich, Korsatkichlar, Nuqta, SahifaSarlavha, Tablar, tugma, type Ton } from '@/components/ui'
import { api } from '@/lib/api'
import { qisqaSom, som, vaqt } from '@/lib/format'

const HUKM_YORLIQ: Record<Hukm, { matn: string; ton: Ton }> = {
  tayyor: { matn: 'Tayyor', ton: 'success' },
  hali_emas: { matn: 'Hali emas', ton: 'warning' },
  olmang: { matn: 'Olmang', ton: 'muted' },
}

function HukmYorliq({ hukm }: { hukm: Hukm }) {
  const h = HUKM_YORLIQ[hukm]
  return <Nuqta ton={h.ton}>{h.matn}</Nuqta>
}

const SHAKL: Record<NonNullable<Profil['shakl']>, string> = {
  yatt: 'YaTT',
  mchj: 'MChJ',
  oilaviy: 'Oilaviy korxona',
  xususiy: 'Xususiy korxona',
  ozini_band: "O'zini o'zi band",
  norasmiy: "Ro'yxatdan o'tmagan",
}
const TARIX: Record<NonNullable<Profil['kredit_tarixi']>, string> = {
  yaxshi: 'Ijobiy',
  yomon: 'Salbiy',
  yoq: "Kredit olmagan",
}

/** Foyda oylik to'lovni necha marta qoplaydi. 1 dan kam — to'lovga yetmaydi. */
function qoplash(a: BankArizasiHolat): number | null {
  const { oylik_foyda, oylik_tolov } = a.natija.hisob
  return oylik_tolov > 0 ? oylik_foyda / oylik_tolov : null
}
const qoplashRang = (k: number) => (k < 1 ? 'text-destructive' : k < 1.2 ? 'text-warning' : 'text-success')

/** Ro'yxat va sarlavha uchun nom: korxona nomi yoki ism, bo'lmasa faoliyat. */
const nomi = (a: BankArizasiHolat) =>
  (yuridikShaxs(a.profil.shakl) && a.profil.korxona_nomi ? `«${a.profil.korxona_nomi}» ${SHAKL_QISQA[a.profil.shakl!] ?? ''}`.trim() : a.profil.ism) ?? a.profil.faoliyat ?? 'Tadbirkor'

/** Tagsatr: faoliyat, shakl, muddat, rahbar. */
const tagsatr = (a: BankArizasiHolat) =>
  [
    a.profil.faoliyat && (a.profil.korxona_nomi || a.profil.ism) ? a.profil.faoliyat : null,
    a.profil.shakl ? SHAKL[a.profil.shakl] : null,
    a.profil.faoliyat_oy != null ? `${a.profil.faoliyat_oy} oy` : null,
    yuridikShaxs(a.profil.shakl) && a.profil.korxona_nomi && a.profil.ism ? a.profil.ism : null,
  ]
    .filter(Boolean)
    .join(', ')

/** Tanlangan bank mahsuloti va hujjatlar holati. */
function Mahsulot({ a }: { a: BankArizasiHolat }) {
  if (!a.papka) return <span className="text-muted-foreground">—</span>
  return (
    <span className="block min-w-0">
      <span className="block truncate font-medium">{a.papka.mahsulot.bank}</span>
      <span className="block text-xs text-muted-foreground tabular-nums">
        Hujjatlar {a.papka.tayyor}/{a.papka.jami}
      </span>
    </span>
  )
}

/** Garov kerakli garovning necha foizi. Garov kerak bo'lmasa null. */
function garovFoiz(a: BankArizasiHolat): number | null {
  const kerak = a.natija.hisob.kerakli_garov
  if (!kerak) return null
  return Math.round(((a.profil.garov_qiymati ?? 0) / kerak) * 100)
}

function Qoplash({ a }: { a: BankArizasiHolat }) {
  const k = qoplash(a)
  if (k == null) return <span className="text-muted-foreground">—</span>
  return <span className={`font-semibold tabular-nums ${qoplashRang(k)}`}>×{k.toFixed(1)}</span>
}

function Garov({ a }: { a: BankArizasiHolat }) {
  const f = garovFoiz(a)
  if (f == null) return <span className="text-success">kerak emas</span>
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-12 overflow-hidden rounded-full bg-border">
        <span
          className={`block h-full rounded-full ${f >= 100 ? 'bg-success' : 'bg-warning'}`}
          style={{ width: `${Math.min(100, f)}%` }}
        />
      </span>
      <span className="tabular-nums">{f}%</span>
    </span>
  )
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
  if (!xato) return <SahifaSkelet />
  return (
    <div className="mt-10 space-y-3 text-center">
      <p>{xato}</p>
      <button type="button" onClick={onQayta} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border px-4">
        <RotateCcw size={16} /> Qayta urinish
      </button>
    </div>
  )
}

function Hisob({ h }: { h: BankHisobi }) {
  return (
    <Korsatkichlar>
      <Korsatkich nom="Yangi arizalar" qiymat={h.holatlar.yangi} izoh={`jami ${h.jami}`} />
      <Korsatkich nom="Ko'rib chiqilmoqda" qiymat={h.holatlar.korilmoqda} />
      <Korsatkich nom="Kredit berildi" qiymat={h.holatlar.berildi} izoh={`${qisqaSom(h.berilgan_summa)} so'm`} />
      <Korsatkich nom="Yetak komissiyasi" qiymat={`${qisqaSom(h.komissiya)} so'm`} izoh={`${h.bank.komissiya_foiz}% berilgan summadan`} />
    </Korsatkichlar>
  )
}

const FILTR: (ArizaHolati | 'hammasi')[] = ['hammasi', 'yangi', 'korilmoqda', 'berildi', 'rad']

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
    <main className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <SahifaSarlavha
          nom={hisob.data?.bank.nom ?? 'Arizalar'}
          izoh="Rozilik bergan va Yetak tekshiruvidan o'tgan tadbirkorlar"
          amal={
            <button type="button" onClick={yangila} className={tugma.sokin}>
              <RotateCcw size={15} /> Yangilash
            </button>
          }
        />

        {hisob.data && <Hisob h={hisob.data} />}

        {!data ? (
          <Holat xato={xato} onQayta={qayta} />
        ) : (
          <div className="mt-10">
            <Tablar
              qiymat={filtr}
              onTanla={setFiltr}
              royxat={FILTR.map((f) => ({
                kalit: f,
                nom: f === 'hammasi' ? 'Hammasi' : QAROR[f].matn,
                soni: f === 'hammasi' ? data.length : data.filter((a) => a.qaror.holat === f).length,
              }))}
            />

            {royxat.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-14 text-center text-muted-foreground">
                <Inbox size={32} />
                <p>
                  {data.length === 0
                    ? "Hozircha ariza yo'q. Tadbirkor chatda rozilik bergach, shu yerda chiqadi."
                    : "Bu holatda ariza yo'q."}
                </p>
              </div>
            ) : (
              <>
                {/* Kompyuter: jadval */}
                <table className="hidden w-full border-b border-border text-sm md:table">
                  <thead className="text-left text-sm text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="py-3 pr-3 font-normal">Tadbirkor</th>
                      <th className="px-3 font-normal">Kredit</th>
                      <th className="px-3 font-normal" title="Oylik foyda oylik to'lovni necha marta qoplaydi">
                        Qoplash
                      </th>
                      <th className="px-3 font-normal">Mahsulot</th>
                      <th className="px-3 font-normal">Yetak bahosi</th>
                      <th className="px-3 font-normal">Holat</th>
                      <th className="px-3 font-normal">Sana</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {royxat.map((a) => (
                      <tr key={a.id} className="group">
                        <td className="py-4 pr-3">
                          <Link to={`/bank/${a.id}`} className="block font-medium hover:underline">
                            {nomi(a)}
                          </Link>
                          <span className="text-xs text-muted-foreground">{tagsatr(a) || '—'}</span>
                        </td>
                        <td className="px-3 tabular-nums">
                          <span className="font-semibold">{a.profil.kredit_summa != null ? qisqaSom(a.profil.kredit_summa) : '—'}</span>
                          <span className="block text-xs text-muted-foreground">
                            {a.profil.kredit_muddat_oy != null ? `${a.profil.kredit_muddat_oy} oyga` : ''}
                          </span>
                        </td>
                        <td className="px-3">
                          <Qoplash a={a} />
                        </td>
                        <td className="max-w-40 px-3">
                          <Mahsulot a={a} />
                        </td>
                        <td className="px-3">
                          <HukmYorliq hukm={a.natija.hukm} />
                        </td>
                        <td className="px-3">
                          <QarorYorliq holat={a.qaror.holat} />
                        </td>
                        <td className="px-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">{vaqt(a.yangilangan)}</td>
                        <td className="pr-3">
                          <Link to={`/bank/${a.id}`} aria-label="Ochish" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground group-hover:bg-foreground/5">
                            <ChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Telefon: kartalar */}
                <ul className="divide-y divide-border border-b border-border md:hidden">
                  {royxat.map((a) => (
                    <li key={a.id}>
                      <Link to={`/bank/${a.id}`} className="block py-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{nomi(a)}</p>
                            <p className="truncate text-xs text-muted-foreground">{tagsatr(a)}</p>
                            <p className="text-sm text-muted-foreground tabular-nums">
                              {a.profil.kredit_summa != null ? `${qisqaSom(a.profil.kredit_summa)} so'm` : '—'}
                              {a.profil.kredit_muddat_oy != null && `, ${a.profil.kredit_muddat_oy} oy`}
                            </p>
                          </div>
                          <QarorYorliq holat={a.qaror.holat} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <HukmYorliq hukm={a.natija.hukm} />
                          <span className="flex items-center gap-1">
                            Qoplash <Qoplash a={a} />
                          </span>
                          {a.papka && (
                            <span className="tabular-nums">
                              {a.papka.mahsulot.bank} · hujjatlar {a.papka.tayyor}/{a.papka.jami}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
          «Qoplash» — oylik foyda taxminiy oylik to'lovni necha marta qoplaydi. «Mahsulot» — tadbirkor tanlagan bank mahsuloti va papkadagi tayyor hujjatlar. Hisob
          Yetak qoidalari bo'yicha, bank o'z baholashini qiladi.
        </p>
      </div>
    </main>
  )
}

function Malumot({ nom, qiymat }: { nom: string; qiymat: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{nom}</dt>
      <dd className="text-right text-sm font-medium tabular-nums">{qiymat}</dd>
    </div>
  )
}

const haYoq = (b?: boolean) => (b == null ? '—' : b ? 'Ha' : "Yo'q")
const pul = (n?: number) => (n == null ? '—' : som(n))

function HujjatlarBolimi({ id, papka }: { id: string; papka: Papka }) {
  const [pdfXato, setPdfXato] = useState<string | null>(null)
  const olib = papka.hujjatlar.filter((h) => !h.bank_ozi_oladi)
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="font-semibold">Hujjatlar</h2>
        <span className="text-sm text-muted-foreground tabular-nums">
          {papka.tayyor} / {papka.jami} tayyor
        </span>
      </div>
      <div className="p-5">
        <p className="mb-3 text-sm text-muted-foreground">
          {papka.mahsulot.bank}, {papka.mahsulot.nom}
        </p>
        {papka.ogohlantirishlar.length > 0 && (
          <ul className="mb-4 space-y-1 border-l-2 border-warning pl-3 text-sm">
            {papka.ogohlantirishlar.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        )}
        <ul className="divide-y divide-border text-sm">
          {olib.map((h) => {
            const t = h.fayl?.tekshiruv
            return (
              <li key={h.kalit} className="flex items-start gap-2.5 py-2.5">
                {!h.fayl ? (
                  <Circle size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                ) : t?.holat === 'muammo' ? (
                  <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warning" />
                ) : (
                  <Check size={16} className={`mt-0.5 shrink-0 ${t ? 'text-success' : 'text-muted-foreground'}`} />
                )}
                <span className="min-w-0">
                  {h.nom}
                  <span className="block text-muted-foreground">
                    {!h.fayl
                      ? h.qoralama
                        ? 'Qoralama papkada'
                        : 'Yuklanmagan'
                      : t
                        ? t.holat === 'mos'
                          ? 'Yuklangan, tekshirilgan'
                          : t.muammolar.join(' ') || 'Muammo bor'
                        : 'Yuklangan, tekshirilmagan'}
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
          className={`${tugma.ikkinchi} mt-4 w-full`}
        >
          <Download size={16} />
          Papkani ochish (PDF)
        </button>
        {pdfXato && <p className="mt-2 text-sm text-destructive">{pdfXato}</p>}
      </div>
    </section>
  )
}

export function BankAriza() {
  const { id = '' } = useParams()
  const yukla = useCallback(() => api.ariza(id), [id])
  const { data, xato, qayta } = useYukla<BankArizasiHolat>(yukla)
  const [joriy, setJoriy] = useState<BankArizasiHolat | null>(null)
  const a = joriy ?? data

  return (
    <main className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <Link to="/bank" className="mb-6 inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Arizalar
        </Link>
        {!a ? (
          <Holat xato={xato} onQayta={qayta} />
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold">{nomi(a)}</h1>
                <p className="mt-1 text-muted-foreground">
                  {a.profil.shakl ? SHAKL[a.profil.shakl] : '—'}
                  {a.profil.faoliyat_oy != null && `, ${a.profil.faoliyat_oy} oy faoliyat`}
                  {a.profil.maqsad && `. Maqsad: ${a.profil.maqsad}`}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  <HukmYorliq hukm={a.natija.hukm} />
                  <QarorYorliq holat={a.qaror.holat} />
                  <span className="text-sm text-muted-foreground">Yangilangan {vaqt(a.yangilangan)}</span>
                </div>
              </div>
            </div>

            <Korsatkichlar>
              <Korsatkich
                nom="So'ralgan kredit"
                qiymat={a.profil.kredit_summa != null ? `${qisqaSom(a.profil.kredit_summa)} so'm` : '—'}
                izoh={a.profil.kredit_muddat_oy != null ? `${a.profil.kredit_muddat_oy} oyga` : undefined}
              />
              <Korsatkich nom="Oylik foyda" qiymat={`${qisqaSom(a.natija.hisob.oylik_foyda)} so'm`} />
              <Korsatkich
                nom="Oylik to'lov"
                qiymat={`${qisqaSom(a.natija.hisob.oylik_tolov)} so'm`}
                izoh={<>taxminiy, qoplash <Qoplash a={a} /></>}
              />
              <Korsatkich nom="Garov" qiymat={<Garov a={a} />} />
            </Korsatkichlar>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <HukmBlok natija={a.natija} />
                <div className="grid gap-4 sm:grid-cols-2">
                  {a.profil.oylik_tushum != null && a.profil.oylik_xarajat != null && (
                    <PulOqimiBlok
                      tushum={a.profil.oylik_tushum}
                      xarajat={a.profil.oylik_xarajat}
                      foyda={a.natija.hisob.oylik_foyda}
                      tolov={a.natija.hisob.oylik_tolov}
                      stavka={a.natija.hisob.yillik_stavka}
                    />
                  )}
                  {a.profil.garov_qiymati != null && <GarovBlok bor={a.profil.garov_qiymati} kerak={a.natija.hisob.kerakli_garov} />}
                </div>
                {a.papka && <HujjatlarBolimi id={a.id} papka={a.papka} />}
                <YolXaritasiBlok qadamlar={a.natija.qadamlar} />
              </div>

              <div className="space-y-4 lg:sticky lg:top-0 lg:self-start">
                <QarorPanel ariza={a} onSaqlandi={setJoriy} />
                <section className="rounded-xl border border-border bg-card">
                  <h2 className="border-b border-border px-5 py-3.5 font-semibold">Tadbirkor ma'lumotlari</h2>
                  <dl className="px-5">
                    <Malumot nom="Oylik tushum" qiymat={pul(a.profil.oylik_tushum)} />
                    <Malumot nom="Oylik xarajat" qiymat={pul(a.profil.oylik_xarajat)} />
                    <Malumot nom="Garov qiymati" qiymat={pul(a.profil.garov_qiymati)} />
                    <Malumot nom="Kredit tarixi" qiymat={a.profil.kredit_tarixi ? TARIX[a.profil.kredit_tarixi] : '—'} />
                    {a.profil.ism && <Malumot nom="Rahbar / egasi" qiymat={a.profil.ism} />}
                    {a.profil.korxona_nomi && <Malumot nom="Korxona" qiymat={a.profil.korxona_nomi} />}
                    {a.profil.stir && <Malumot nom="STIR" qiymat={a.profil.stir} />}
                    {a.papka && <Malumot nom="Tanlangan mahsulot" qiymat={`${a.papka.mahsulot.bank} — ${a.papka.mahsulot.nom}`} />}
                    {a.profil.eri_bor != null && <Malumot nom="Elektron imzo" qiymat={haYoq(a.profil.eri_bor)} />}
                  </dl>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
