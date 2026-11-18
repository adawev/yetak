// Hujjatlar papkasi: bank mahsuloti uchun kerakli hujjatlar, qayerdan olish, yuklash va AI tekshiruvi.
import type { OlishYoli, Papka, PapkaHujjat, SessiyaHolati } from '@shared/types'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleAlert,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  FolderOpen,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { BankLogo } from '@/components/BankKartalar'
import { papkaPdfUrl } from '@/lib/api'
import { PDF_KATTA, RASM_XOM_MAKS, rasmmi } from '@/lib/rasm'

export const hujjatlarHodisasi = 'yetak:hujjatlar'
export const PAPKA_ID = 'hujjatlar-papka'

/** Chatdagi kartadan "Hujjatlar" bo'limini ochish (telefonda yorliq, kompyuterda panelga o'tish). */
export const hujjatlarniOch = () => window.dispatchEvent(new Event(hujjatlarHodisasi))

const MAKS = 10 * 1024 * 1024

export interface HujjatAmallari {
  yuklanayotgan: Record<string, boolean>
  xatolar: Record<string, string>
  onYukla: (kalit: string, fayl: File) => void
  onOchir: (kalit: string) => void
  onXato: (kalit: string, matn: string | null) => void
  onMahsulot: (kalit: string) => void
}

function faylXatosi(f: File): string | null {
  if (f.type !== 'application/pdf' && !rasmmi(f)) return "Faqat rasm (JPG, PNG, WebP) yoki PDF yuklash mumkin."
  if (f.type === 'application/pdf' && f.size > MAKS) return PDF_KATTA
  if (f.size > RASM_XOM_MAKS) return `Fayl katta (${(f.size / 1024 / 1024).toFixed(1)} MB). 25 MB dan oshmasin.`
  return null
}

function Nusxa({ matn }: { matn: string }) {
  const [nusxalandi, setNusxalandi] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(matn).then(() => {
          setNusxalandi(true)
          setTimeout(() => setNusxalandi(false), 1500)
        })
      }}
      className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium hover:bg-foreground/5"
    >
      {nusxalandi ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      {nusxalandi ? 'Nusxalandi' : 'Nusxa'}
    </button>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs">{children}</span>
}

function Yoriqnoma({ olish }: { olish: OlishYoli | null }) {
  if (!olish) {
    return <p className="text-sm text-muted-foreground">Bu hujjatni rasmga olib yuklang — Yetak tekshirib, papkaga qo'shadi.</p>
  }
  return (
    <div className="space-y-2 text-sm">
      {olish.qadamlar.length > 0 && (
        <p>
          <span className="text-muted-foreground">Qayerda: </span>
          <span className="font-medium">{olish.qayerda}</span>
        </p>
      )}
      {olish.qidiruv && (
        <div className="flex items-center gap-2 rounded-md bg-primary-soft px-2.5 py-2">
          <p className="min-w-0 flex-1">
            Qidiruvga yozing: <span className="font-semibold">«{olish.qidiruv}»</span>
          </p>
          <Nusxa matn={olish.qidiruv} />
        </div>
      )}
      {olish.qadamlar.length === 0 && olish.qayerda && (
        <p>
          <span className="text-muted-foreground">Qayerdan: </span>
          <span className="font-medium">{olish.qayerda}</span>
        </p>
      )}
      {olish.qadamlar.length > 0 && (
        <ol className="list-decimal space-y-0.5 pl-5">
          {olish.qadamlar.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-1.5">
        {olish.vaqt && <Chip>Vaqt: {olish.vaqt}</Chip>}
        {olish.narx && <Chip>Narx: {olish.narx}</Chip>}
        {olish.eri_kerak && <Chip>ERI kerak</Chip>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {olish.havola && (
          <a
            href={olish.havola}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium hover:bg-foreground/5"
          >
            Ochish <ExternalLink size={14} />
          </a>
        )}
        {olish.manba && (
          <a
            href={olish.manba}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline"
          >
            Manba <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  )
}

function Belgi({ h, tekshirilmoqda }: { h: PapkaHujjat; tekshirilmoqda: boolean }) {
  if (tekshirilmoqda) return <Loader2 size={20} className="mt-0.5 shrink-0 animate-spin text-muted-foreground" />
  if (!h.fayl && h.qoralama) return <FileCheck size={20} className="mt-0.5 shrink-0 text-success" />
  if (!h.fayl) return <Circle size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
  const t = h.fayl.tekshiruv
  if (!t) return <CircleAlert size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
  if (t.holat === 'mos') return <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success" />
  return <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" />
}

function Natija({ h }: { h: PapkaHujjat }) {
  const f = h.fayl
  if (!f) return null
  const t = f.tekshiruv
  if (!t) {
    return (
      <p className="mt-2 rounded-md bg-foreground/5 px-2.5 py-2 text-sm text-muted-foreground">
        Yuklandi, lekin avtomatik tekshirib bo'lmadi. Fayl baribir papkaga kiradi — o'zingiz ham tekshirib oling.
      </p>
    )
  }
  const mos = t.holat === 'mos'
  return (
    <div className={`mt-2 rounded-md px-2.5 py-2 text-sm ${mos ? 'bg-success/10' : 'bg-warning/10'}`}>
      <p className={`font-medium ${mos ? 'text-success' : 'text-warning'}`}>
        {mos ? 'Mos' : 'Muammo bor'} · {t.hujjat_turi}
      </p>
      {t.izoh && <p className="mt-0.5">{t.izoh}</p>}
      {t.muammolar.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {t.muammolar.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Hujjat({
  h,
  a,
  boshidanOchiq = false,
  pdfUrl,
}: {
  h: PapkaHujjat
  a: HujjatAmallari
  boshidanOchiq?: boolean
  /** Yetak qoralamasini ko'rish uchun papka PDF havolasi */
  pdfUrl?: string
}) {
  const [ochiq, setOchiq] = useState(boshidanOchiq && !h.qoralama)
  const yetakniki = !!h.qoralama && !h.fayl
  const input = useRef<HTMLInputElement>(null)
  const tekshirilmoqda = !!a.yuklanayotgan[h.kalit]
  const xato = a.xatolar[h.kalit]

  const tanla = (f: File | undefined) => {
    if (!f) return
    const x = faylXatosi(f)
    if (x) a.onXato(h.kalit, x)
    else a.onYukla(h.kalit, f)
    if (input.current) input.current.value = ''
  }

  return (
    <li className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-2">
        <Belgi h={h} tekshirilmoqda={tekshirilmoqda} />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{h.nom}</p>
          {h.shart && (
            <span className="mt-0.5 inline-block rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning">
              {h.shart}
            </span>
          )}
          {h.fayl && !tekshirilmoqda && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <FileText size={12} className="shrink-0" />
              <span className="truncate">{h.fayl.nom}</span>
            </p>
          )}
        </div>
      </div>

      {yetakniki && !tekshirilmoqda && (
        <p className="mt-2 rounded-md bg-success/10 px-2.5 py-2 text-sm text-success">
          <span className="font-semibold">Yetak tayyorladi.</span> {h.qoralama}
        </p>
      )}
      {yetakniki && !tekshirilmoqda && h.qoralama_asos && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Bankda qanday o'tadi: </span>
          {h.qoralama_asos.matn}{' '}
          {h.qoralama_asos.manba && (
            <a href={h.qoralama_asos.manba} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline">
              Manba <ExternalLink size={10} />
            </a>
          )}
        </p>
      )}
      {tekshirilmoqda && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 size={14} className="animate-spin" />
          Tekshirilmoqda… (30 soniyagacha)
        </p>
      )}
      {!tekshirilmoqda && <Natija h={h} />}
      {xato && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {xato}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={input}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => tanla(e.target.files?.[0])}
        />
        {yetakniki && pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <FileText size={16} />
            Ko'rish (PDF)
          </a>
        )}
        <button
          type="button"
          disabled={tekshirilmoqda}
          onClick={() => input.current?.click()}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium disabled:opacity-50 ${
            h.fayl || yetakniki ? 'border border-border hover:bg-foreground/5' : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          <Upload size={16} />
          {h.fayl ? 'Qayta yuklash' : yetakniki ? 'Imzolanganini yuklash' : 'Yuklash'}
        </button>
        {h.fayl && (
          <button
            type="button"
            disabled={tekshirilmoqda}
            onClick={() => a.onOchir(h.kalit)}
            className="min-h-11 rounded-lg px-3 text-sm text-muted-foreground hover:bg-foreground/5 disabled:opacity-50"
          >
            O'chirish
          </button>
        )}
        <button
          type="button"
          onClick={() => setOchiq(!ochiq)}
          aria-expanded={ochiq}
          className="ml-auto inline-flex min-h-9 items-center gap-1 text-xs font-medium underline underline-offset-2"
        >
          {yetakniki ? 'Nima qilish kerak' : 'Qanday olinadi'}
          <ChevronDown size={14} className={ochiq ? 'rotate-180' : ''} />
        </button>
      </div>

      {ochiq && (
        <div className="mt-2 border-t border-border pt-2">
          <Yoriqnoma olish={h.olish} />
        </div>
      )}
    </li>
  )
}

function Guruh({ sarlavha, izoh, children }: { sarlavha: string; izoh?: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{sarlavha}</h3>
      {izoh && <p className="text-xs text-muted-foreground">{izoh}</p>}
      <ul className="mt-1.5 space-y-2">{children}</ul>
    </section>
  )
}

function TayyorlashTaklifi() {
  const [ochiq, setOchiq] = useState(false)
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-medium">Mutaxassis tekshiruvi</h4>
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">Demo</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Reja: bank tajribasi bor mutaxassis papkangizni bankka yuborishdan oldin qo'lda ko'rib chiqadi.
      </p>
      <p className="text-sm font-medium">20 000 so'm</p>
      {ochiq ? (
        <div role="status" className="flex items-start gap-2 rounded-lg bg-foreground/5 px-3 py-2 text-sm">
          <span className="min-w-0 flex-1">Demo: to'lov hali ulanmagan. Taqdimotdan keyin ishga tushadi.</span>
          <button type="button" onClick={() => setOchiq(false)} aria-label="Yopish" className="p-1">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOchiq(true)}
          className="min-h-11 w-full rounded-lg border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary"
        >
          Buyurtma berish
        </button>
      )}
    </div>
  )
}

export function HujjatlarPapka({ holat, amallar }: { holat: SessiyaHolati; amallar: HujjatAmallari }) {
  const p = holat.papka
  if (!p) return null
  const olibBoriladi = p.hujjatlar.filter((h) => !h.bank_ozi_oladi && !h.tavsiya)
  const tavsiya = p.hujjatlar.filter((h) => !h.bank_ozi_oladi && h.tavsiya)
  const bankOzi = p.hujjatlar.filter((h) => h.bank_ozi_oladi)
  const yuklangan = p.hujjatlar.filter((h) => h.fayl).length
  const foiz = p.jami ? (p.tayyor / p.jami) * 100 : 0

  const variantlar = [...(holat.mahsulotlar ?? [])].sort(
    (x, y) => Number(x.mos === 'mos_emas') - Number(y.mos === 'mos_emas'),
  )

  return (
    <div id={PAPKA_ID} className="scroll-mt-4 space-y-3 rounded-lg border border-border bg-card/50 p-3">
      <div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FolderOpen size={16} />
          Hujjatlar papkasi
        </p>
        <p className="mt-1 font-semibold">{p.mahsulot.bank}</p>
        <p className="text-sm">{p.mahsulot.nom}</p>
        {variantlar.length > 1 && (
          <label className="mt-2 block text-xs text-muted-foreground">
            Boshqa mahsulot tanlash
            <select
              value={p.mahsulot.kalit}
              onChange={(e) => amallar.onMahsulot(e.target.value)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-card px-2 text-sm text-foreground truncate pr-8 text-ellipsis"
            >
              {variantlar.map((m) => (
                <option key={m.kalit} value={m.kalit}>
                  {m.bank} — {m.nom}
                  {m.mos === 'mos_emas' ? ' (mos emas)' : ''}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Tayyor hujjatlar</span>
            <span className="font-medium tabular-nums">
              {p.tayyor} / {p.jami}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-foreground/10"
            role="progressbar"
            aria-valuenow={p.tayyor}
            aria-valuemax={p.jami}
          >
            <div
              className={`h-full rounded-full transition-all ${p.jami > 0 && p.tayyor >= p.jami ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${foiz}%` }}
            />
          </div>
        </div>
      </div>

      {p.ogohlantirishlar.length > 0 && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-2.5 text-sm" role="alert">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-warning">
            <AlertTriangle size={16} />
            Hujjatlar bir-biriga mos kelmayapti
          </p>
          <ul className="list-disc space-y-0.5 pl-5">
            {p.ogohlantirishlar.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {olibBoriladi.length > 0 && (
        <Guruh sarlavha="Kerakli hujjatlar" izoh="Yetak tayyorlaganlarini tekshirib imzolaysiz, qolganini rasmga olib yuklaysiz.">
          {olibBoriladi.map((h) => (
            <Hujjat key={h.kalit} h={h} a={amallar} pdfUrl={papkaPdfUrl(holat.id)} />
          ))}
        </Guruh>
      )}
      {tavsiya.length > 0 && (
        <Guruh sarlavha="Oldindan tekshiring" izoh="Bank so'ramasligi mumkin, lekin arizadan oldin o'zingiz ko'rib qo'ygan yaxshi.">
          {tavsiya.map((h) => (
            <Hujjat key={h.kalit} h={h} a={amallar} pdfUrl={papkaPdfUrl(holat.id)} />
          ))}
        </Guruh>
      )}
      {bankOzi.length > 0 && (
        <Guruh sarlavha="Bank o'zi oladi" izoh="Sizdan kerak emas — bank davlat tizimidan o'zi oladi.">
          {bankOzi.map((h) => (
            <li key={h.kalit} className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <Check size={16} className="mt-0.5 shrink-0 text-success" />
              <span className="min-w-0">
                {h.nom}
                {h.shart && <span className="text-xs text-muted-foreground"> · {h.shart}</span>}
              </span>
            </li>
          ))}
        </Guruh>
      )}

      <TayyorlashTaklifi />

      <div className="border-t border-border pt-3">
        {yuklangan > 0 || p.hujjatlar.some((h) => h.qoralama) ? (
          <a
            href={papkaPdfUrl(holat.id)}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-medium text-primary-foreground hover:opacity-90"
          >
            <Download size={18} />
            Papkani yuklab olish (PDF)
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-foreground/10 px-4 font-medium text-muted-foreground"
          >
            <Download size={18} />
            Papkani yuklab olish (PDF)
          </span>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          Hamma hujjat bitta faylda: muqova, ro'yxat va yuklaganlaringiz.
        </p>
      </div>
    </div>
  )
}

const tayyormi = (h: PapkaHujjat) => h.fayl?.tekshiruv?.holat === 'mos' || (!h.fayl && !!h.qoralama)

/**
 * Chatdagi hujjatlar — bitta-bitta: tepada bank va jarayon, navbatdagi hujjat ochiq turadi
 * (qanday olish + yuklash), qolganlari qisqa qator. Bosilgan qator navbatdagi bo'ladi.
 */
export function HujjatQadamlari({
  holat,
  amallar,
  onRozilik,
}: {
  holat: SessiyaHolati
  amallar: HujjatAmallari
  onRozilik?: (rozi: boolean) => void
}) {
  const p = holat.papka
  const hammasi = (p?.hujjatlar ?? []).filter((h) => !h.bank_ozi_oladi)
  const yetak = hammasi.filter((h) => h.qoralama && !h.fayl)
  const kerak = hammasi.filter((h) => !(h.qoralama && !h.fayl))
  const birinchi = kerak.find((h) => !tayyormi(h))?.kalit ?? null
  const [tanlangan, setTanlangan] = useState<string | null>(null)
  if (!p) return null
  const joriy = tanlangan ?? birinchi
  const foiz = p.jami ? (p.tayyor / p.jami) * 100 : 0
  const pdfBor = p.hujjatlar.some((h) => h.fayl || h.qoralama)
  const pdf = papkaPdfUrl(holat.id)

  return (
    <div className="kirish space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <BankLogo bank={p.mahsulot.bank} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{p.mahsulot.bank} uchun hujjatlar</p>
          <p className="truncate text-sm text-muted-foreground">{p.mahsulot.nom}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {p.tayyor}/{p.jami}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/10" role="progressbar" aria-valuenow={p.tayyor} aria-valuemax={p.jami}>
        <div
          className={`h-full rounded-full transition-all ${p.jami && p.tayyor >= p.jami ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${foiz}%` }}
        />
      </div>

      {yetak.length > 0 && (
        <div className="rounded-xl bg-success/10 p-3">
          <p className="text-sm font-semibold text-success">Yetak tayyorladi — {yetak.length} ta</p>
          <p className="text-xs text-muted-foreground">Sizning javoblaringizdan to'ldirildi. Tekshirib, imzolaysiz.</p>
          <ul className="mt-2 space-y-1">
            {yetak.map((h) =>
              h.kalit === joriy ? (
                <Hujjat key={h.kalit} h={h} a={amallar} pdfUrl={pdf} boshidanOchiq />
              ) : (
                <li key={h.kalit}>
                  <button
                    type="button"
                    onClick={() => setTanlangan(h.kalit)}
                    className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-1 text-left text-sm hover:bg-foreground/5"
                  >
                    <FileCheck size={18} className="shrink-0 text-success" />
                    <span className="min-w-0 flex-1">{h.nom}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">imzo kerak</span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {kerak.length > 0 && <p className="pt-1 text-sm font-semibold">Sizdan kerak — rasmga olib yuklang</p>}
      <ol className="space-y-1">
        {kerak.map((h, i) =>
          h.kalit === joriy ? (
            <Hujjat key={h.kalit} h={h} a={amallar} pdfUrl={pdf} boshidanOchiq />
          ) : (
            <li key={h.kalit}>
              <button
                type="button"
                onClick={() => setTanlangan(h.kalit)}
                className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2 text-left text-sm hover:bg-foreground/5"
              >
                {tayyormi(h) ? (
                  <CheckCircle2 size={20} className="shrink-0 text-success" />
                ) : (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[11px] text-muted-foreground">
                    {i + 1}
                  </span>
                )}
                <span className={`min-w-0 flex-1 ${tayyormi(h) ? 'text-muted-foreground' : ''}`}>{h.nom}</span>
                {h.tavsiya && <span className="shrink-0 text-xs text-muted-foreground">tavsiya</span>}
              </button>
            </li>
          ),
        )}
      </ol>

      {pdfBor && (
        <a
          href={pdf}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-foreground/5"
        >
          <Download size={16} />
          Papkani ko'rish (PDF)
        </a>
      )}

      {onRozilik &&
        (holat.bank_roziligi ? (
          <div className="rounded-xl bg-success/10 p-3 text-sm">
            <p className="font-semibold text-success">Papka bank xodimi oynasiga tushdi</p>
            <p className="text-muted-foreground">
              Demo: hamkor bank hali yo'q — papka Yetakning bank oynasida ko'rinadi. Shartnomani bankda imzolaysiz.
            </p>
            <button type="button" onClick={() => onRozilik(false)} className="mt-1 text-xs text-muted-foreground underline">
              Rozilikni qaytarib olish
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onRozilik(true)}
              className="min-h-12 w-full rounded-xl bg-primary px-4 text-[15px] font-semibold text-white hover:opacity-90"
            >
              Papkani bank xodimiga yuborish
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Roziligingiz bilan bank xodimi papkani ko'radi. Hujjat yig'ib bankka qatnamaysiz.
            </p>
          </div>
        ))}
    </div>
  )
}

/** Chatdagi qisqa karta: nechta hujjat kerak, nechtasi tayyor. */
export function HujjatlarKarta({ papka }: { papka: Papka }) {
  const kerak = papka.hujjatlar.filter((h) => !h.bank_ozi_oladi && !h.tavsiya)
  const korinadi = kerak.slice(0, 4)
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <FolderOpen size={16} />
        Hujjatlar papkasi
      </p>
      <p className="font-medium">
        Sizga kerakli hujjatlar: {papka.jami} ta, {papka.tayyor} tasi tayyor
      </p>
      <ul className="mt-1.5 space-y-0.5 text-sm">
        {korinadi.map((h) => (
          <li key={h.kalit} className="flex gap-1.5">
            {h.fayl?.tekshiruv?.holat === 'mos' ? (
              <Check size={14} className="mt-1 shrink-0 text-success" />
            ) : (
              <Circle size={14} className="mt-1 shrink-0 text-muted-foreground" />
            )}
            <span className="min-w-0">{h.nom}</span>
          </li>
        ))}
        {kerak.length > korinadi.length && (
          <li className="text-muted-foreground">va yana {kerak.length - korinadi.length} ta…</li>
        )}
      </ul>
      <button
        type="button"
        onClick={hujjatlarniOch}
        className="mt-2 min-h-11 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Hujjatlarni ochish
      </button>
    </div>
  )
}
