// Kirgan foydalanuvchi. Token localStorage da; server har so'rovda tekshiradi.
import type { Foydalanuvchi, KirishJavobi, MeningSuhbatim, Rol } from '@shared/types'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { LockKeyhole } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api, ApiXato, tokenOl, tokenSaqla } from '@/lib/api'

const SESSIYA = 'yetak.sessiya_id' // useSessiya bilan bir xil kalit

export function joriySessiya(): string | undefined {
  try {
    return localStorage.getItem(SESSIYA) ?? undefined
  } catch {
    return undefined
  }
}

/** id berilmasa — chat yangi suhbat ochadi. */
export function sessiyaTanla(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSIYA, id)
    else localStorage.removeItem(SESSIYA)
  } catch {
    /* bo'lmasa yangi suhbat ochiladi */
  }
}

export const BOSH_SAHIFA: Record<Rol, string> = { tadbirkor: '/chat', bank: '/bank', admin: '/admin' }

interface Auth {
  f: Foydalanuvchi | null
  suhbatlar: MeningSuhbatim[]
  tayyor: boolean
  kirdi: (j: KirishJavobi) => Promise<void>
  chiqish: () => Promise<void>
  yangila: () => Promise<void>
}

const AuthCtx = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [f, setF] = useState<Foydalanuvchi | null>(null)
  const [suhbatlar, setSuhbatlar] = useState<MeningSuhbatim[]>([])
  const [tayyor, setTayyor] = useState(() => !tokenOl())

  const yangila = useCallback(async () => {
    if (!tokenOl()) return
    try {
      const sid = joriySessiya()
      // Tadbirkorning bitta suhbati bor. Bo'lsa — shuni ochamiz, yo'q bo'lsa — joriy suhbat unga biriktiriladi.
      let men = await api.men()
      if (men.foydalanuvchi.rol === 'tadbirkor') {
        const uniki = men.suhbatlar[0]?.id
        if (uniki && uniki !== sid) sessiyaTanla(uniki)
        else if (!uniki && sid) men = await api.biriktir(sid).catch(() => men)
      }
      setF(men.foydalanuvchi)
      setSuhbatlar(men.suhbatlar)
    } catch (e) {
      if (e instanceof ApiXato && e.status === 401) {
        tokenSaqla(null)
        setF(null)
      }
    } finally {
      setTayyor(true)
    }
  }, [])

  useEffect(() => {
    void yangila()
  }, [yangila])

  const kirdi = useCallback(
    async (j: KirishJavobi) => {
      tokenSaqla(j.token)
      setF(j.foydalanuvchi)
      await yangila() // tadbirkor suhbati tanlanib bo'lgach chatga o'tiladi
    },
    [yangila],
  )

  const chiqish = useCallback(async () => {
    await api.chiqish().catch(() => undefined)
    tokenSaqla(null)
    setF(null)
    setSuhbatlar([])
  }, [])

  return <AuthCtx.Provider value={{ f, suhbatlar, tayyor, kirdi, chiqish, yangila }}>{children}</AuthCtx.Provider>
}

export function useAuth(): Auth {
  const a = useContext(AuthCtx)
  if (!a) throw new Error('AuthProvider yo‘q')
  return a
}

const ROL_NOMI: Record<Rol, string> = { tadbirkor: 'tadbirkor', bank: 'bank xodimi', admin: 'admin' }
const KIMGA: Record<Rol, string> = {
  tadbirkor: 'tadbirkorlar',
  bank: 'hamkor bank xodimlari',
  admin: 'Yetak administratori',
}

/** Boshqa rol bilan kirgan odamga: nega ochilmayapti va qanday kirish. */
function RuxsatYoq({ rol, f }: { rol: Rol; f: Foydalanuvchi }) {
  const { chiqish } = useAuth()
  const nav = useNavigate()
  const yol = location.pathname
  return (
    <main className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <LockKeyhole size={22} />
        </span>
        <h1 className="font-display text-xl font-semibold">Bu oyna {KIMGA[rol]} uchun</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Siz <b className="text-foreground">{f.ism}</b> — {ROL_NOMI[f.rol]} sifatida kirgansiz.
        </p>
        <button
          type="button"
          onClick={() => void chiqish().then(() => nav(`/login?next=${encodeURIComponent(yol)}`))}
          className="mt-5 min-h-11 w-full rounded-lg bg-primary font-medium text-white"
        >
          {ROL_NOMI[rol][0].toUpperCase() + ROL_NOMI[rol].slice(1)} akkaunti bilan kirish
        </button>
        <button
          type="button"
          onClick={() => nav(BOSH_SAHIFA[f.rol])}
          className="mt-2 min-h-11 w-full rounded-lg text-sm text-muted-foreground hover:bg-foreground/5"
        >
          Orqaga
        </button>
      </div>
    </main>
  )
}

/** Sahifa faqat shu rol uchun. Kirmagan bo'lsa — kirish sahifasiga, boshqa rol bo'lsa — tushuntirish. */
export function Himoya({ rol, children }: { rol: Rol; children: ReactNode }) {
  const { f, tayyor } = useAuth()
  if (!tayyor) return null
  if (!f) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (f.rol !== rol) return <RuxsatYoq rol={rol} f={f} />
  return <>{children}</>
}
