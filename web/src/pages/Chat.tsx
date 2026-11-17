import { Loader2, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Kiritish, Kutish, Tugmalar, XabarPufak, XatoBanner } from '@/components/chat'
import { Jarayon, Panel } from '@/components/Panel'
import { useSessiya } from '@/hooks/useSessiya'
import { MOCK } from '@/lib/api'

type Yorliq = 'suhbat' | 'reja'

const SSENARIYLAR = [
  ['tayyor', 'Tayyor'],
  ['hali_emas', 'Hali emas'],
  ['olmang', 'Olmang'],
] as const

export default function Chat() {
  const s = useSessiya()
  const [yorliq, setYorliq] = useState<Yorliq>('suhbat')
  const oxiri = useRef<HTMLDivElement>(null)
  const h = s.holat

  const birinchi = useRef(true)
  useEffect(() => {
    if (!oxiri.current) return
    // Birinchi ochilishda darhol, keyin silliq pastga tushadi
    oxiri.current.scrollIntoView({ behavior: birinchi.current ? 'auto' : 'smooth', block: 'end' })
    birinchi.current = false
  }, [h?.xabarlar.length, s.kutilayotgan, yorliq])

  if (!h) {
    return (
      <div className="grid h-full place-items-center p-4">
        {s.yuklanmoqda ? (
          <Loader2 className="animate-spin text-muted-foreground" />
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

  const ssenariyTanla = (nom: string) => {
    history.replaceState(null, '', `?ssenariy=${nom}`)
    setYorliq('suhbat')
    void s.yangiSuhbat()
  }

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Telefon: jarayon va yorliqlar */}
      <div className="space-y-2 border-b border-border px-4 py-2 lg:hidden">
        <Jarayon {...h.jarayon} />
        <div className="grid grid-cols-2 rounded-lg bg-foreground/5 p-1 text-sm font-medium" role="tablist">
          {(['suhbat', 'reja'] as const).map((y) => (
            <button
              key={y}
              type="button"
              role="tab"
              aria-selected={yorliq === y}
              onClick={() => setYorliq(y)}
              className={`min-h-9 rounded-md ${yorliq === y ? 'bg-card shadow-none' : 'text-muted-foreground'}`}
            >
              {y === 'suhbat' ? 'Suhbat' : h.natija ? 'Reja •' : 'Reja'}
            </button>
          ))}
        </div>
      </div>

      {/* Suhbat */}
      <section className={`${yorliq === 'reja' ? 'hidden' : 'flex'} min-h-0 flex-1 flex-col lg:flex`}>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
          {h.xabarlar.map((x, i) => (
            <XabarPufak
              key={x.id ?? `${x.vaqt}-${i}`}
              xabar={x}
              natija={h.natija}
              onBelgila={s.qadamBelgila}
            />
          ))}
          {s.kutilayotgan && (
            <XabarPufak xabar={{ kim: 'tadbirkor', matn: s.kutilayotgan }} natija={null} holati="yuborilmoqda" />
          )}
          {s.yuborilmagan && (
            <XabarPufak xabar={{ kim: 'tadbirkor', matn: s.yuborilmagan }} natija={null} holati="yuborilmadi" />
          )}
          {s.yuborilmoqda && <Kutish />}
          {!s.yuborilmoqda && (
            <Tugmalar tugmalar={h.tugmalar} onTanla={(t) => void s.yubor(t)} />
          )}
          <div ref={oxiri} />
        </div>
        <div className="space-y-2 border-t border-border px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {s.xato && (
            <XatoBanner
              matn={s.xato}
              onQayta={s.yuborilmagan ? () => void s.yubor(s.yuborilmagan!) : undefined}
              onYop={s.xatoniYop}
            />
          )}
          <Kiritish band={s.yuborilmoqda} onYubor={(m) => void s.yubor(m)} />
        </div>
      </section>

      {/* Holat paneli */}
      <aside
        className={`${yorliq === 'suhbat' ? 'hidden' : 'block'} min-h-0 flex-1 overflow-y-auto border-border p-4 lg:block lg:border-l`}
      >
        <Panel s={s} />
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => void s.yangiSuhbat()}
            className="flex min-h-9 items-center gap-1 rounded-md px-2 hover:bg-foreground/5"
          >
            <RotateCcw size={14} /> Yangi suhbat
          </button>
          {MOCK && (
            <>
              <span className="ml-auto">Namuna rejimi:</span>
              {SSENARIYLAR.map(([nom, yozuv]) => (
                <button
                  key={nom}
                  type="button"
                  onClick={() => ssenariyTanla(nom)}
                  className="min-h-9 rounded-md border border-border px-2 hover:bg-foreground/5"
                >
                  {yozuv}
                </button>
              ))}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
