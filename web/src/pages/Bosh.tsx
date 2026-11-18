// Bosh sahifa. Dizayn qoidalari: docs/DIZAYN.md → «Sahifa qoidalari».
// Yagona urg'u — «tayyorgarlik varaqasi» (DEMO.md dagi non sexi namunasi; raqamlar faqat shu hikoyadan:
// tushum 40, xarajat 28 → foyda 12 mln). Boshqa raqam o'ylab topilmagan.
import { Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'

function Qator({ nom, qiymat }: { nom: string; qiymat: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <dt className="text-muted-foreground">{nom}</dt>
      <dd className="text-right font-medium tabular-nums">{qiymat}</dd>
    </div>
  )
}

function Talab({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          ok ? 'bg-success text-white' : 'border border-destructive text-destructive'
        }`}
      >
        {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      </span>
      <span className={ok ? '' : 'font-medium'}>{children}</span>
    </li>
  )
}

/** Bank hujjatiga o'xshash varaqa: Yetak natijasining qisqa ko'rinishi. */
function Varaqa() {
  return (
    <figure className="rounded-xl border border-border bg-card text-[15px]">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <p className="font-semibold">Kredit tayyorgarligi</p>
        <p className="text-sm text-muted-foreground">Namuna</p>
      </div>

      <dl className="divide-y divide-border px-6">
        <Qator nom="Faoliyat" qiymat="Non sexi, YaTT, 14 oy" />
        <Qator nom="So'ralgan kredit" qiymat="120 000 000 so'm" />
        <Qator nom="Muddat" qiymat="24 oy" />
        <Qator nom="Oylik foyda" qiymat="12 000 000 so'm" />
      </dl>

      <div className="border-t border-border px-6 pt-4">
        <p className="text-sm text-muted-foreground">Bank talablari</p>
        <ul className="divide-y divide-border">
          <Talab ok>Kamida 1 yil faoliyat</Talab>
          <Talab ok>Kredit tarixida muammo yo'q</Talab>
          <Talab ok={false}>Garov yetarli emas</Talab>
          <Talab ok={false}>Elektron imzo yo'q</Talab>
        </ul>
      </div>

      <div className="mt-2 rounded-b-xl border-t border-border bg-surface px-6 py-4">
        <p className="text-sm text-muted-foreground">Keyingi qadam</p>
        <p className="mt-0.5 font-medium">Elektron imzo olish, keyin garov masalasi</p>
      </div>
    </figure>
  )
}

const QADAMLAR = [
  ['Yozasiz', "Biznesingiz haqida o'z so'zingiz bilan: nima ish, qancha tushum, qancha pul kerak."],
  ['Tekshiramiz', "Pul oqimi, garov, kredit tarixi — bank qaraydigan narsalarning o'zi."],
  ["Yo'l ko'rsatamiz", 'Qaysi bank mahsuloti mos, nima yetishmaydi va birinchi qadam nima.'],
  ['Bankka yetkazamiz', "Tayyor bo'lganingizda arizangiz faqat roziligingiz bilan bankka boradi."],
]

const TAMOYILLAR = [
  [
    'Har shartning manbasi bor',
    "Foiz, summa va garov talabi bank sahifasi yoki rasmiy hujjatdan olinadi. Topilmagan narsani «bilmaymiz» deymiz.",
  ],
  [
    'Roziligingizsiz — hech kimga',
    "Ma'lumotingizni bank faqat siz rozilik berganingizda ko'radi. Istalgan payt qaytarib olasiz.",
  ],
  [
    'Hisobni kod qiladi',
    "To'lov, foyda va garov formulalar bilan hisoblanadi. Sun'iy intellekt faqat gaplashadi va tushuntiradi.",
  ],
]

export default function Bosh() {
  return (
    <main className="h-full overflow-y-auto">
      {/* Kirish */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_440px] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <h1 className="max-w-xl text-4xl leading-[1.1] font-semibold sm:text-5xl lg:text-[3.4rem]">
            Bankka borishdan oldin kreditga tayyorligingizni biling
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Yetak biznesingizni bank talablari bilan solishtiradi, mos kreditni va yetishmayotgan narsani ko'rsatadi. Tadbirkor
            uchun bepul.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/chat"
              className="inline-flex min-h-12 items-center rounded-lg bg-primary px-6 text-lg font-medium text-white transition-opacity hover:opacity-90"
            >
              Biznesim haqida yozish
            </Link>
            <Link to="/register" className="font-medium underline underline-offset-4 hover:no-underline">
              Ro'yxatdan o'tish
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Taxminan 5 daqiqa. Ro'yxatdan o'tish shart emas.</p>
        </div>
        <Varaqa />
      </section>

      {/* Qanday ishlaydi */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">Qanday ishlaydi</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {QADAMLAR.map(([nom, matn], i) => (
              <li key={nom} className="border-t-2 border-foreground pt-4">
                <p className="text-sm text-muted-foreground tabular-nums">{i + 1}-qadam</p>
                <h3 className="mt-1 text-lg font-semibold">{nom}</h3>
                <p className="mt-2 text-muted-foreground">{matn}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Kim to'laydi */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Tadbirkor hech narsa to'lamaydi</h2>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Xizmat haqini hamkor bank to'laydi — faqat Yetak orqali kelgan mijozga kredit berilganda.
            </p>
          </div>
          <dl className="divide-y divide-border border-y border-border">
            <div className="flex items-baseline justify-between gap-6 py-5">
              <dt>Tadbirkor uchun</dt>
              <dd className="text-3xl font-semibold tabular-nums">0 so'm</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-5">
              <dt>Bank uchun</dt>
              <dd className="text-right text-lg font-medium">berilgan kreditdan foiz</dd>
            </div>
            <div className="py-5 text-muted-foreground">
              Shuning uchun bizga «hammaga ariza» emas, qaytara oladigan va tayyor mijoz kerak. Qarorni har doim bank qiladi.
            </div>
          </dl>
        </div>
      </section>

      {/* Tamoyillar */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">Nega ishonsa bo'ladi</h2>
        <dl className="mt-8 divide-y divide-border border-y border-border">
          {TAMOYILLAR.map(([nom, matn]) => (
            <div key={nom} className="grid gap-2 py-6 md:grid-cols-[320px_1fr] md:gap-8">
              <dt className="font-semibold">{nom}</dt>
              <dd className="max-w-2xl text-muted-foreground">{matn}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted-foreground">
          Shartlari bank sahifalaridan tekshirilgan mahsulotlar: Hamkorbank, Ipak Yo'li Banki, TBC Bank, Mikrokreditbank.
        </p>
      </section>

      {/* Yakun */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-lg text-2xl font-semibold sm:text-3xl">Bir necha jumla yozing — qolganini Yetak ko'rsatadi.</h2>
          <Link
            to="/chat"
            className="inline-flex min-h-12 shrink-0 items-center rounded-lg bg-foreground px-6 text-lg font-medium text-background transition-opacity hover:opacity-90"
          >
            Boshlash
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <p>© 2026 Yetak. Kredit qarorini bank qiladi.</p>
          <Link to="/login" className="hover:text-foreground">
            Bank xodimlari uchun kirish
          </Link>
        </div>
      </footer>
    </main>
  )
}
