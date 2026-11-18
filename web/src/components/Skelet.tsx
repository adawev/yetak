// Yuklanish skeletlari: sahifa tuzilishini oldindan ko'rsatadi (aylanuvchi belgi o'rniga).

export function Skelet({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skelet ${className}`} style={style} aria-hidden />
}

/** Chat ochilayotganda: avatar va bir nechta pufak. */
export function ChatSkelet() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-5" role="status" aria-label="Yuklanmoqda">
      <div className="space-y-2 border-b border-border pb-3">
        <Skelet className="h-1.5 w-full" />
      </div>
      {[64, 48, 72].map((w, i) => (
        <div key={i} className="space-y-5">
          <div className="flex gap-2.5">
            <Skelet className="h-8 w-8 shrink-0 rounded-full" />
            <Skelet className="h-14 rounded-2xl" style={{ width: `${w}%` }} />
          </div>
          <div className="flex justify-end">
            <Skelet className="h-10 w-32 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Kabinet sahifalari (bank, admin) ochilayotganda: sarlavha, ko'rsatkichlar, ro'yxat. */
export function SahifaSkelet() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6" role="status" aria-label="Yuklanmoqda">
      <div className="space-y-2">
        <Skelet className="h-8 w-48" />
        <Skelet className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 p-5">
            <Skelet className="h-3.5 w-24" />
            <Skelet className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skelet key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
