import type { ReactNode } from 'react'

// Agent matni uchun kichik markdown: **qalin**, [havola](url), "- " ro'yxat, bo'sh qator — yangi paragraf.

const BELGI = /\*\*(.+?)\*\*|\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g

function qator(s: string): ReactNode[] {
  const qismlar: ReactNode[] = []
  let oxirgi = 0
  for (const m of s.matchAll(BELGI)) {
    const i = m.index ?? 0
    if (i > oxirgi) qismlar.push(s.slice(oxirgi, i))
    if (m[1]) qismlar.push(<strong key={i} className="font-semibold">{m[1]}</strong>)
    else
      qismlar.push(
        <a key={i} href={m[3]} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          {m[2]}
        </a>,
      )
    oxirgi = i + m[0].length
  }
  if (oxirgi < s.length) qismlar.push(s.slice(oxirgi))
  return qismlar
}

export function Matn({ matn }: { matn: string }) {
  return (
    <div className="space-y-2">
      {matn.split(/\n{2,}/).map((p, i) => {
        const satrlar = p.split('\n')
        if (satrlar.every((s) => s.trim().startsWith('- '))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {satrlar.map((s, j) => (
                <li key={j}>{qator(s.trim().slice(2))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i}>
            {satrlar.map((s, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {qator(s)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
