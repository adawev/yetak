import { Check, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { maydon as M, tugma } from '@/components/ui'
import { api } from '@/lib/api'
import { BOSH_SAHIFA, joriySessiya, useAuth } from '@/lib/auth'

// Demo akkauntlar — server/src/hisoblar.ts dagi DEMO bilan bir xil (taqdimot uchun, maxfiy emas).
const DEMO_BANK = { telefon: '998900000002', parol: 'yetak-demo' }
const DEMO_ADMIN = { telefon: '998900000001', parol: 'yetak-demo' }

const maydon = `${M} mt-1.5 min-h-12`

export default function Kirish({ royxat = false }: { royxat?: boolean }) {
  const { f, kirdi } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [ism, setIsm] = useState('')
  const [telefon, setTelefon] = useState('')
  const [parol, setParol] = useState('')
  const [xato, setXato] = useState<string | null>(null)
  const [band, setBand] = useState(false)

  if (f) return <Navigate to={BOSH_SAHIFA[f.rol]} replace />

  const yubor = (e: FormEvent) => {
    e.preventDefault()
    return kir(royxat ? 'royxat' : { telefon, parol })
  }

  /** Oddiy kirish yoki demo akkaunt bilan bir bosishda kirish. */
  const kir = async (k: 'royxat' | { telefon: string; parol: string }) => {
    setXato(null)
    setBand(true)
    try {
      const sessiya_id = joriySessiya()
      const j =
        k === 'royxat'
          ? await api.royxat({ ism, telefon, parol, sessiya_id })
          : await api.kirish({ ...k, sessiya_id })
      await kirdi(j)
      const keyin = params.get('next')
      nav(keyin?.startsWith('/') ? keyin : BOSH_SAHIFA[j.foydalanuvchi.rol], { replace: true })
    } catch (e) {
      setXato(e instanceof Error ? e.message : 'Nimadir xato ketdi.')
    } finally {
      setBand(false)
    }
  }

  const afzalliklar = royxat
    ? ["Suhbat va yo'l xaritangiz har qurilmada", 'Bajarilgan qadamlar belgilanib boradi', "Tadbirkor uchun 0 so'm"]
    : ["Tadbirkor — o'z suhbati va yo'l xaritasi", 'Bank xodimi — tekshirilgan, rozilik bergan arizalar', 'Admin — hamkor banklar va hisobot']

  return (
    <main className="grid h-full overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Chap panel: kim nima oladi */}
      <aside className="hidden border-r border-border bg-surface p-12 lg:flex lg:flex-col lg:justify-center">
        <h2 className="max-w-md text-4xl leading-tight font-semibold">{royxat ? "Yo'lingiz saqlanadi" : 'Bitta oyna, uch tomon'}</h2>
        <ul className="mt-8 max-w-md divide-y divide-border border-y border-border">
          {afzalliklar.map((x) => (
            <li key={x} className="flex gap-3 py-3.5">
              <Check size={18} className="mt-0.5 shrink-0 text-success" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">Roziligingizsiz ma'lumotingiz hech bir bankka bormaydi.</p>
      </aside>

      <div className="flex items-start justify-center p-4 sm:items-center sm:p-8">
        <form onSubmit={yubor} className="mt-6 w-full max-w-sm space-y-5 sm:mt-0">
          <div>
            <h1 className="text-3xl font-semibold">{royxat ? "Ro'yxatdan o'tish" : 'Xush kelibsiz'}</h1>
            <p className="mt-1 text-muted-foreground">
              {royxat
                ? "Suhbatingiz va yo'l xaritangiz saqlanadi — boshqa qurilmadan ham davom ettirasiz."
                : 'Tadbirkor, bank xodimi yoki admin — bitta oyna.'}
            </p>
          </div>

          {royxat && (
            <label className="block text-sm font-medium">
              Ismingiz
              <input className={maydon} value={ism} onChange={(e) => setIsm(e.target.value)} autoComplete="name" required />
            </label>
          )}
          <label className="block text-sm font-medium">
            Telefon raqam
            <span className="relative block">
              <span className="pointer-events-none absolute top-1/2 left-3 mt-[3px] -translate-y-1/2 text-base text-muted-foreground">
                +998
              </span>
              <input
                className={`${maydon} pl-14`}
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="90 123 45 67"
                required
              />
            </span>
          </label>
          <label className="block text-sm font-medium">
            Parol
            <input
              className={maydon}
              type="password"
              value={parol}
              onChange={(e) => setParol(e.target.value)}
              autoComplete={royxat ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
            {royxat && <span className="mt-1 block text-sm font-normal text-muted-foreground">Kamida 6 belgi</span>}
          </label>

          {xato && <p className="border-l-2 border-destructive pl-3 text-sm text-destructive">{xato}</p>}

          <button type="submit" disabled={band} className={`${tugma.asosiy} min-h-12 w-full`}>
            {band && <Loader2 size={16} className="animate-spin" />}
            {royxat ? "Ro'yxatdan o'tish" : 'Kirish'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {royxat ? (
              <>
                Akkauntingiz bormi?{' '}
                <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
                  Kirish
                </Link>
              </>
            ) : (
              <>
                Tadbirkormisiz?{' '}
                <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
                  Ro'yxatdan o'ting
                </Link>
              </>
            )}
          </p>
          {royxat && (
            <p className="text-center text-sm text-muted-foreground">Yetak tadbirkor uchun bepul. Ro'yxatdan o'tish ixtiyoriy.</p>
          )}

          {!royxat && (
            <div className="border-t border-border pt-5">
              <p className="mb-3 text-center text-sm text-muted-foreground">Demo: parolsiz, bir bosishda</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={band} onClick={() => kir(DEMO_BANK)} className={tugma.ikkinchi}>
                  Bank xodimi
                </button>
                <button type="button" disabled={band} onClick={() => kir(DEMO_ADMIN)} className={tugma.ikkinchi}>
                  Admin
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
