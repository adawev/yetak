import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { MOCK } from '@/lib/api'
import Bank from '@/pages/Bank'
import Chat from '@/pages/Chat'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-dvh flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <picture>
            <source srcSet="/yetak-mark-dark.svg" media="(prefers-color-scheme: dark)" />
            <img src="/yetak-mark.svg" alt="" className="h-7 w-7" />
          </picture>
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Yetak
          </Link>
          {MOCK && (
            <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
              namuna
            </span>
          )}
        </header>
        <div className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/bank" element={<Bank />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
