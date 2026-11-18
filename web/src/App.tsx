import { ChartPie, Inbox, LogIn, LogOut, MessageCircleMore, type LucideIcon } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Ikon } from '@/components/Ikon'
import { AuthProvider, Himoya, useAuth } from '@/lib/auth'
import { ChatSkelet, SahifaSkelet } from '@/components/Skelet'
import Bosh from '@/pages/Bosh'

// Bosh sahifa darhol; qolganlari kerak bo'lganda yuklanadi (birinchi ochilish tezroq).
const Chat = lazy(() => import('@/pages/Chat'))
const Kirish = lazy(() => import('@/pages/Kirish'))
const Bank = lazy(() => import('@/pages/Bank'))
const BankAriza = lazy(() => import('@/pages/Bank').then((m) => ({ default: m.BankAriza })))
const Admin = lazy(() => import('@/pages/Admin'))

/** Menyudagi bitta ikonka: faol bo'lsa to'q sariq doira. Nomi — tooltip va ekran o'quvchi uchun. */
function MenyuIkon({ to, nom, belgi: Belgi }: { to: string; nom: string; belgi: LucideIcon }) {
  return (
    <Ikon nom={nom}>
      {(cls) => (
        <NavLink to={to} aria-label={nom} className={({ isActive }) => cls(isActive)}>
          <Belgi size={19} strokeWidth={2.1} />
        </NavLink>
      )}
    </Ikon>
  )
}

const NOMLAR: [RegExp, string][] = [
  [/^\/chat/, 'Suhbat'],
  [/^\/login/, 'Kirish'],
  [/^\/register/, "Ro'yxatdan o'tish"],
  [/^\/bank\/./, 'Ariza'],
  [/^\/bank/, 'Arizalar'],
  [/^\/admin/, 'Boshqaruv'],
]

/** Brauzer yorlig'idagi nom sahifaga qarab o'zgaradi. */
function SahifaNomi() {
  const { pathname } = useLocation()
  useEffect(() => {
    const nom = NOMLAR.find(([r]) => r.test(pathname))?.[1]
    document.title = nom ? `${nom} · Yetak` : "Yetak — kreditga tayyor bo'lib boring"
  }, [pathname])
  return null
}

function Sarlavha() {
  const { f, chiqish } = useAuth()
  const nav = useNavigate()
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2" aria-label="Yetak — bosh sahifa">
        <picture>
          <source srcSet="/yetak-mark-dark.svg" media="(prefers-color-scheme: dark)" />
          <img src="/yetak-mark.svg" alt="" className="h-6 w-6" />
        </picture>
        <span className="text-lg font-bold tracking-tight">Yetak</span>
      </Link>

      <nav className="ml-auto flex items-center gap-2" aria-label="Asosiy menyu">
        <div className="flex items-center gap-1">
          {(!f || f.rol === 'tadbirkor') && <MenyuIkon to="/chat" nom="Suhbat" belgi={MessageCircleMore} />}
          {f?.rol === 'bank' && <MenyuIkon to="/bank" nom="Arizalar" belgi={Inbox} />}
          {f?.rol === 'admin' && <MenyuIkon to="/admin" nom="Hisobot va banklar" belgi={ChartPie} />}
          {!f && <MenyuIkon to="/login" nom="Kirish" belgi={LogIn} />}
        </div>

        {f && (
          <div className="flex items-center gap-1">
            <span
              title={f.ism}
              aria-label={f.ism}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-semibold"
            >
              {f.ism.trim().charAt(0).toUpperCase()}
            </span>
            <Ikon nom="Chiqish">
              {(cls) => (
                <button
                  type="button"
                  aria-label="Chiqish"
                  className={cls(false)}
                  onClick={() => {
                    // Avval himoyalangan sahifadan chiqamiz, aks holda kirish sahifasiga otib yuboradi
                    nav('/')
                    void chiqish()
                  }}
                >
                  <LogOut size={18} strokeWidth={2.1} />
                </button>
              )}
            </Ikon>
          </div>
        )}
      </nav>
    </header>
  )
}

export default function App() {
  // Bosh sahifa chizilgach chatni oldindan yuklab qo'yamiz — «Biznesim haqida yozish» bosilganda kutish bo'lmasin.
  useEffect(() => {
    const t = setTimeout(() => void import('@/pages/Chat'), 1200)
    return () => clearTimeout(t)
  }, [])
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex h-dvh flex-col">
          <SahifaNomi />
          <Sarlavha />
          <div className="min-h-0 flex-1">
            <Routes>
              <Route path="/" element={<Bosh />} />
              <Route path="/chat" element={<Suspense fallback={<ChatSkelet />}><Chat /></Suspense>} />
              <Route path="/login" element={<Suspense fallback={null}><Kirish /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={null}><Kirish royxat /></Suspense>} />
              <Route path="/bank" element={<Himoya rol="bank"><Suspense fallback={<SahifaSkelet />}><Bank /></Suspense></Himoya>} />
              <Route path="/bank/:id" element={<Himoya rol="bank"><Suspense fallback={<SahifaSkelet />}><BankAriza /></Suspense></Himoya>} />
              <Route path="/admin" element={<Himoya rol="admin"><Suspense fallback={<SahifaSkelet />}><Admin /></Suspense></Himoya>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
