// Bosh sahifa. Qahramon qismida — mahsulotning haqiqiy kartalari (DEMO.md dagi non sexi namunasi).
// Raqamlar faqat shu hikoyadan: tushum 40, xarajat 28 → foyda 12 mln. Boshqa raqam o'ylab topilmagan.
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  FileCheck2,
  Landmark,
  MessageCircleMore,
  ScanSearch,
  ShieldCheck,
  Signpost,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const BANKLAR = ['Hamkorbank', "Ipak Yo'li Banki", 'TBC Bank', 'Mikrokreditbank']

/** Hero o'ng tomoni: chat, hukm, mos mahsulot va pul oqimi — ilovadagi kabi. */
function Kompozitsiya() {
  return (
    <div className="mx-auto flex w-full max-w-[460px] flex-col gap-3 select-none sm:relative sm:block sm:h-[560px]" aria-hidden>
      {/* Tadbirkor xabari */}
      <div className="suzadi w-[90%] self-end sm:absolute sm:top-0 sm:right-0 sm:w-[82%] rounded-2xl rounded-br-md bg-primary p-4 text-[15px] leading-snug text-white shadow-xl shadow-primary/20 [--r:1.5deg]">
        Non sexim bor, YaTT, 14 oydan beri ishlayman. Oyiga 40 mln tushum, 28 mln xarajat. Tandir uchun 120 mln kerak.
      </div>

      {/* Hukm */}
      <div className="suzadi-2 w-[90%] sm:absolute sm:top-[132px] sm:left-0 sm:w-[78%] rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/5 [--r:-1.5deg]">
        <p className="flex items-center gap-2 font-display text-lg font-bold text-warning">
          <span className="h-2.5 w-2.5 rounded-full bg-warning" /> Hali tayyor emassiz
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Ikki narsa tuzatiladi: garov va elektron imzo.</p>
        <div className="mt-3 flex gap-1">
          {[1, 1, 1, 0, 0].map((x, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${x ? 'bg-success' : 'bg-warning'}`} />
          ))}
        </div>
      </div>

      {/* Mos bank mahsuloti */}
      <div className="suzadi-3 w-[94%] self-end sm:absolute sm:top-[262px] sm:right-0 sm:w-[86%] rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/5 [--r:1deg]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">Hamkorbank</p>
            <p className="text-sm text-muted-foreground">«Kichik biznesga ko'mak»</p>
          </div>
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">Aniqlash kerak</span>
        </div>
        <ul className="mt-2.5 space-y-1 text-sm">
          <li className="flex gap-1.5">
            <Check size={15} className="mt-0.5 shrink-0 text-success" /> Kamida 1 yil faoliyat
          </li>
          <li className="flex gap-1.5">
            <Check size={15} className="mt-0.5 shrink-0 text-success" /> Summa 300 mln gacha
          </li>
          <li className="flex gap-1.5">
            <CircleHelp size={15} className="mt-0.5 shrink-0 text-warning" /> 20 mln uchun garov — bank baholaydi
          </li>
        </ul>
      </div>

      {/* Pul oqimi */}
      <div className="w-[78%] rounded-2xl bg-foreground sm:absolute sm:bottom-0 sm:left-[6%] sm:w-[58%] p-4 text-background shadow-2xl">
        <p className="text-xs opacity-70">Oylik pul oqimi</p>
        <div className="mt-2 space-y-1.5 text-xs">
          {[
            ['Tushum', 100, '40 mln'],
            ['Xarajat', 70, '28 mln'],
            ['Foyda', 30, '12 mln'],
          ].map(([nom, w, q]) => (
            <div key={nom} className="grid grid-cols-[52px_1fr] items-center gap-2">
              <span className="opacity-70">{nom}</span>
              <span
                className={`flex h-5 min-w-fit items-center rounded px-1.5 font-semibold whitespace-nowrap ${nom === 'Foyda' ? 'bg-success text-white' : 'bg-background/15'}`}
                style={{ width: `${w}%` }}
              >
                {q}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const BEKATLAR: { belgi: ReactNode; sarlavha: string; matn: string }[] = [
  {
    belgi: <MessageCircleMore size={20} />,
    sarlavha: 'Gapirasiz',
    matn: "O'z so'zingiz bilan: nima ish, qancha tushum, qancha pul kerak. Anketa yo'q.",
  },
  {
    belgi: <ScanSearch size={20} />,
    sarlavha: 'Tekshiramiz',
    matn: "Pul oqimi, garov, kredit tarixi — bank qaraydigan narsalarning o'zi.",
  },
  {
    belgi: <Signpost size={20} />,
    sarlavha: "Yo'l chizamiz",
    matn: "Mos mahsulot, yetishmagan shart va birinchi qadam. Har shartning manbasi bor.",
  },
  {
    belgi: <Landmark size={20} />,
    sarlavha: 'Bankka yetaklaymiz',
    matn: "Tayyor bo'lganingizda — faqat roziligingiz bilan arizangiz bankka boradi.",
  },
]

export default function Bosh() {
  return (
    <main className="h-full overflow-y-auto overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="nuqtali relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm">
              <span className="h-2 w-2 rounded-full bg-success" />
              Kichik biznes uchun · bepul
            </p>
            <h1 className="font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-6xl lg:text-[4.2rem]">
              Bankka{' '}
              <span className="relative inline-block whitespace-nowrap text-primary">
                tayyor
                <svg viewBox="0 0 200 14" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none">
                  <path
                    className="chiziladi"
                    d="M2 9 C 50 2, 120 2, 198 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              bo'lib boring.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Yetak biznesingizni bank ko'zi bilan tekshiradi, qaysi kredit mos kelishini va nima yetishmayotganini aytadi —
              keyin bankkacha qadam-baqadam olib boradi.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/chat"
                className="group flex min-h-13 items-center gap-2 rounded-full bg-foreground py-3 pr-3 pl-6 text-lg font-medium text-background shadow-lg transition hover:shadow-xl"
              >
                Biznesim haqida yozaman
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition group-hover:translate-x-0.5">
                  <ArrowRight size={18} />
                </span>
              </Link>
              <Link to="/register" className="min-h-11 px-3 py-2.5 font-medium underline-offset-4 hover:underline">
                Ro'yxatdan o'tish
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">3–5 daqiqa. Ro'yxatdan o'tmasdan ham boshlash mumkin.</p>
          </div>

          <div>
            <Kompozitsiya />
            <p className="mt-4 text-center text-xs text-muted-foreground">Namuna: non sexi egasining suhbati</p>
          </div>
        </div>
      </section>

      {/* ── Banklar qatori ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 md:flex-row md:items-center md:gap-8">
          <p className="shrink-0 text-sm text-muted-foreground md:w-56">Shartlari bank sahifalaridan tekshirilgan mahsulotlar</p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {BANKLAR.map((b) => (
              <li key={b} className="font-display text-xl font-bold tracking-tight text-foreground/70">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Yo'l ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Qanday ishlaydi</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Arizadan oldingi yo'l — <span className="text-muted-foreground">endi yolg'iz emas.</span>
          </h2>
        </div>

        <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
          {/* yo'l chizig'i */}
          <svg className="pointer-events-none absolute top-6 left-6 hidden h-2 w-[calc(100%-3rem)] md:block" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden>
            <line x1="0" y1="1" x2="100" y2="1" stroke="var(--border)" strokeWidth="2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          </svg>
          {BEKATLAR.map((b, i) => (
            <li key={b.sarlavha} className="relative">
              <span
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                  i === BEKATLAR.length - 1 ? 'border-primary bg-primary text-white' : 'border-border bg-card text-foreground'
                }`}
              >
                {b.belgi}
              </span>
              <p className="mt-4 text-xs font-semibold text-muted-foreground tabular-nums">0{i + 1}</p>
              <h3 className="font-display text-xl font-bold">{b.sarlavha}</h3>
              <p className="mt-1.5 text-muted-foreground">{b.matn}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Kim to'laydi ── */}
      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">Kim to'laydi</p>
            <p className="mt-3 font-display text-[5.5rem] leading-none font-extrabold tracking-[-0.04em] sm:text-[7rem]">
              0 <span className="text-primary">so'm</span>
            </p>
            <p className="mt-3 text-xl opacity-80">tadbirkor uchun. Hech qanday yashirin to'lov yo'q.</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-background/15 p-6">
              <p className="font-display text-2xl font-bold">Bank faqat natija uchun to'laydi</p>
              <p className="mt-2 opacity-75">
                Hamkor bank komissiyani faqat Yetak orqali kelgan mijozga kredit berilgandagina to'laydi. Shuning uchun bizga
                «hammaga ariza» emas — qaytara oladigan, tayyor mijoz kerak.
              </p>
            </div>
            <div className="rounded-2xl border border-background/15 p-6">
              <p className="font-display text-2xl font-bold">«Kredit olasiz» demaymiz</p>
              <p className="mt-2 opacity-75">
                Qarorni bank qiladi. Biz arizangizni shu qarorga tayyorlaymiz va nima yetishmasligini oldindan aytamiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ishonch ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {[
            {
              b: <FileCheck2 size={22} />,
              s: 'Har shartning manbasi',
              m: "Foiz, summa, garov — bank sahifasi yoki rasmiy hujjatdan. Topilmagan narsani «bilmaymiz» deymiz.",
            },
            {
              b: <ShieldCheck size={22} />,
              s: 'Roziligingizsiz — hech kimga',
              m: "Ma'lumotingizni bank faqat siz «roziman» deganingizda ko'radi. Istalgan payt qaytarib olasiz.",
            },
            {
              b: <ScanSearch size={22} />,
              s: 'Hisobni kod qiladi',
              m: "To'lov, foyda, garov yetarliligi — formulalar bilan. Sun'iy intellekt faqat gaplashadi va tushuntiradi.",
            },
          ].map((x) => (
            <div key={x.s} className="bg-card p-6">
              <span className="text-primary">{x.b}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{x.s}</h3>
              <p className="mt-1.5 text-muted-foreground">{x.m}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Yakuniy chaqiriq ── */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-white sm:px-12">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full border-[40px] border-white/10" />
          <h2 className="relative max-w-xl font-display text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Birinchi qadam — bir necha jumla.
          </h2>
          <Link
            to="/chat"
            className="relative mt-8 flex max-w-xl items-center gap-3 rounded-full bg-white p-2 pl-5 text-left text-foreground shadow-xl"
          >
            <span className="min-w-0 flex-1 truncate text-muted-foreground">Masalan: «Tikuv sexim bor, 2 yildan beri…»</span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <ArrowUpRight size={20} />
            </span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
          <p>© 2026 Yetak · Kredit qarorini bank qiladi.</p>
          <Link to="/login" className="flex items-center gap-1.5 hover:text-foreground">
            <Landmark size={15} /> Bank xodimlari uchun kirish
          </Link>
        </div>
      </footer>
    </main>
  )
}
