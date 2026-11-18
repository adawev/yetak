import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { BOSH_SAHIFA, joriySessiya, useAuth } from '@/lib/auth'

// Demo akkauntlar — server/src/hisoblar.ts dagi DEMO bilan bir xil (taqdimot uchun, maxfiy emas).
const DEMO_BANK = { telefon: '998900000002', parol: 'yetak-demo' }
const DEMO_ADMIN = { telefon: '998900000001', parol: 'yetak-demo' }

const maydon =
  'mt-1 block min-h-11 w-full rounded-lg border border-border bg-card px-3 text-base outline-none focus:border-primary'

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

  return (
    <main className="h-full overflow-y-auto p-4">
      <form onSubmit={yubor} className="mx-auto mt-6 max-w-sm space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h1 className="font-display text-2xl font-bold">{royxat ? "Ro'yxatdan o'tish" : 'Kirish'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
          <input
            className={maydon}
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="90 123 45 67"
            required
          />
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
          {royxat && <span className="mt-1 block text-xs text-muted-foreground">Kamida 6 belgi</span>}
        </label>

        {xato && <p className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">{xato}</p>}

        <button
          type="submit"
          disabled={band}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-white disabled:opacity-60"
        >
          {band && <Loader2 size={16} className="animate-spin" />}
          {royxat ? "Ro'yxatdan o'tish" : 'Kirish'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {royxat ? (
            <>
              Akkauntingiz bormi?{' '}
              <Link to="/login" className="font-medium text-foreground underline">
                Kirish
              </Link>
            </>
          ) : (
            <>
              Tadbirkormisiz?{' '}
              <Link to="/register" className="font-medium text-foreground underline">
                Ro'yxatdan o'ting
              </Link>
            </>
          )}
        </p>
        {royxat && (
          <p className="text-center text-xs text-muted-foreground">Yetak tadbirkor uchun bepul. Ro'yxatdan o'tish ixtiyoriy.</p>
        )}

        {!royxat && (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-center text-xs text-muted-foreground">Demo: parolsiz, bir bosishda</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={band}
                onClick={() => kir(DEMO_BANK)}
                className="min-h-11 rounded-lg border border-border text-sm font-medium hover:bg-foreground/5 disabled:opacity-60"
              >
                Bank xodimi
              </button>
              <button
                type="button"
                disabled={band}
                onClick={() => kir(DEMO_ADMIN)}
                className="min-h-11 rounded-lg border border-border text-sm font-medium hover:bg-foreground/5 disabled:opacity-60"
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  )
}
