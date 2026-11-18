import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChatImkon } from '@/components/bloklar'
import { Kiritish, Kutish, Tugmalar, XabarPufak, XatoBanner } from '@/components/chat'
import { ChatSkelet } from '@/components/Skelet'
import { HujjatlarPapka, hujjatlarHodisasi, PAPKA_ID } from '@/components/Hujjatlar'
import { Panel } from '@/components/Panel'
import { useSessiya } from '@/hooks/useSessiya'

type Yorliq = 'suhbat' | 'batafsil'

/** 6 ta savol jarayoni — nuqtalar bilan. Natija chiqqach yashiriladi. */
function Savollar({ toldirilgan, jami }: { toldirilgan: number; jami: number }) {
  return (
    <div className="flex items-center gap-3" aria-label={`Savollar: ${toldirilgan} / ${jami}`}>
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: jami }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i < toldirilgan ? 'bg-primary' : 'bg-foreground/10'}`}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
        {toldirilgan < jami ? `${toldirilgan + 1}-savol, ${jami} tadan` : 'Banklar tanlanmoqda'}
      </span>
    </div>
  )
}

export default function Chat() {
  const s = useSessiya()
  const [yorliq, setYorliq] = useState<Yorliq>('suhbat')
  const oxiri = useRef<HTMLDivElement>(null)
  const ruyxat = useRef<HTMLDivElement>(null)
  const h = s.holat

  // Sahifa ochilganda bor xabarlar — eski; keyin kelganlari animatsiya bilan chiqadi.
  const boshlangich = useRef<number | null>(null)
  if (h && boshlangich.current === null) boshlangich.current = h.xabarlar.length

  // Yangi agent xabari kelsa — uning BOSHIGA aylantiramiz (uzun kartalar tepadan o'qiladi).
  // Tadbirkor yozganda va birinchi ochilishda — oxiriga.
  const avvalgiSoni = useRef(0)
  const xabarSoni = h?.xabarlar.length ?? 0
  const oxirgiKim = h?.xabarlar[xabarSoni - 1]?.kim
  useEffect(() => {
    if (!xabarSoni) return
    const soni = xabarSoni
    const yangiAgent = avvalgiSoni.current > 0 && soni > avvalgiSoni.current && oxirgiKim === 'agent'
    avvalgiSoni.current = soni
    requestAnimationFrame(() => {
      if (yangiAgent) {
        const el = ruyxat.current?.querySelector<HTMLElement>(`[data-xabar="${soni - 1}"]`)
        el?.scrollIntoView({ behavior: 'auto', block: 'start' })
      } else {
        oxiri.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
    })
  }, [xabarSoni, oxirgiKim])

  useEffect(() => {
    if (s.kutilayotgan) oxiri.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [s.kutilayotgan])

  // Chatdagi "Hujjatlarni ochish": telefonda yorliq, kompyuterda panelga o'tadi
  useEffect(() => {
    const och = () => {
      setYorliq('batafsil')
      requestAnimationFrame(() => {
        const joy = [...document.querySelectorAll(`#${PAPKA_ID}`)].find((e) => (e as HTMLElement).offsetParent !== null)
        joy?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
    window.addEventListener(hujjatlarHodisasi, och)
    return () => window.removeEventListener(hujjatlarHodisasi, och)
  }, [])

  const oxirgiHujjatlar = useMemo(() => {
    if (!h) return -1
    for (let i = h.xabarlar.length - 1; i >= 0; i--) {
      if (h.xabarlar[i].bloklar?.some((b) => b.tur === 'hujjatlar')) return i
    }
    return -1
  }, [h])

  if (!h) {
    return (
      <div className="grid h-full place-items-center p-4">
        {s.yuklanmoqda ? (
          <ChatSkelet />
        ) : (
          <div className="max-w-sm space-y-3 text-center">
            <p>{s.xato ?? 'Suhbatni ochib bo‘lmadi.'}</p>
            <button
              type="button"
              onClick={() => void s.qaytaYukla()}
              className="min-h-11 rounded-lg bg-primary px-4 font-medium text-white"
            >
              Qayta urinish
            </button>
          </div>
        )}
      </div>
    )
  }

  const yubor = (m: string) => void s.yubor(m)
  const imkon = (i: number): ChatImkon => ({
    holat: h,
    amallar: s.hujjatAmallari,
    onYubor: yubor,
    onRozilik: (r: boolean) => void s.rozilikBer(r),
    yangi: i >= (boshlangich.current ?? 0),
    oxirgiHujjatlar: i === oxirgiHujjatlar,
  })
  const papkaBor = !!h.papka && !!h.bank_tanlangan
  const yorliqlar: Yorliq[] = h.natija ? ['suhbat', 'batafsil'] : ['suhbat']
  const tahlil = s.yuborilmoqda && !h.natija && h.jarayon.toldirilgan >= h.jarayon.jami - 1

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      {/* Tepada: savollar jarayoni, natijadan keyin — Suhbat | Batafsil */}
      <div className="space-y-2 border-b border-border px-4 py-2.5">
          {!h.natija && <Savollar {...h.jarayon} />}
          {yorliqlar.length > 1 && (
            <div
              className="grid rounded-xl bg-foreground/5 p-1 text-sm font-medium"
              role="tablist"
              style={{ gridTemplateColumns: `repeat(${yorliqlar.length}, minmax(0, 1fr))` }}
            >
              {yorliqlar.map((y) => (
                <button
                  key={y}
                  type="button"
                  role="tab"
                  aria-selected={yorliq === y}
                  onClick={() => setYorliq(y)}
                  className={`min-h-9 rounded-lg ${yorliq === y ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}
                >
                  {y === 'suhbat' ? 'Suhbat' : papkaBor ? `Batafsil · hujjatlar ${h.papka?.tayyor ?? 0}/${h.papka?.jami ?? 0}` : 'Batafsil'}
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Suhbat */}
      <section className={`${yorliq !== 'suhbat' ? 'hidden' : 'flex'} min-h-0 flex-1 flex-col`}>
        <div ref={ruyxat} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5" aria-live="polite">
          {h.xabarlar.map((x, i) => (
            <div key={`${x.vaqt}-${i}`} data-xabar={i} className={`scroll-mt-3 ${i >= (boshlangich.current ?? 0) ? 'kirish' : ''}`}>
              <XabarPufak
                xabar={x}
                natija={h.natija}
                papka={h.papka}
                onBelgila={s.qadamBelgila}
                chat={x.kim === 'agent' ? imkon(i) : undefined}
              />
            </div>
          ))}
          {s.kutilayotgan && (
            <XabarPufak
              xabar={{ kim: 'tadbirkor', matn: s.kutilayotgan, rasm: !!s.kutilayotganRasm }}
              rasmUrl={s.kutilayotganRasm}
              natija={null}
              holati="yuborilmoqda"
            />
          )}
          {s.yuborilmagan && (
            <XabarPufak xabar={{ kim: 'tadbirkor', matn: s.yuborilmagan, rasm: !!s.yuborilmaganFayl }} natija={null} holati="yuborilmadi" />
          )}
          {s.yuborilmoqda && <Kutish tahlil={tahlil} />}
          {!s.yuborilmoqda && <Tugmalar tugmalar={h.tugmalar} onTanla={yubor} />}
          <div ref={oxiri} />
        </div>
        <div className="space-y-2 border-t border-border px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {s.xato && (
            <XatoBanner
              matn={s.xato}
              onQayta={s.yuborilmagan ? () => void s.yubor(s.yuborilmagan!, s.yuborilmaganFayl) : undefined}
              onYop={s.xatoniYop}
            />
          )}
          <Kiritish band={s.yuborilmoqda} onYubor={(m, f) => void s.yubor(m, f)} />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => void s.yangiSuhbat()}
              className="flex min-h-8 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-foreground/5"
            >
              <RotateCcw size={12} /> Yangi suhbat
            </button>
          </div>
        </div>
      </section>

      {/* Batafsil: hujjatlar papkasi (bank tanlangach) va hisob-kitob tafsilotlari */}
      {h.natija && yorliq === 'batafsil' && (
        <aside className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {papkaBor && <HujjatlarPapka holat={h} amallar={s.hujjatAmallari} />}
          <Panel s={s} />
        </aside>
      )}
    </div>
  )
}
