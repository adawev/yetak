import type { BankArizasi, XatoJavobi } from '@shared/types'
import type { BoySessiya } from '@/lib/bloklar'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export class ApiXato extends Error {
  status?: number
  constructor(xabar: string, status?: number) {
    super(xabar)
    this.status = status
  }
}

async function sorov<T>(yol: string, init?: RequestInit, kutish = 60_000): Promise<T> {
  const boshqaruv = new AbortController()
  const taymer = setTimeout(() => boshqaruv.abort(), kutish)
  let javob: Response
  try {
    javob = await fetch(`${API}${yol}`, {
      ...init,
      signal: boshqaruv.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    if (boshqaruv.signal.aborted) throw new ApiXato("Javob kelmadi. Qayta urinib ko'ring.")
    if (!navigator.onLine) throw new ApiXato("Internet yo'q. Ulanganingizdan keyin qayta urinib ko'ring.")
    throw new ApiXato("Server bilan aloqa yo'q. Birozdan keyin qayta urinib ko'ring.")
  } finally {
    clearTimeout(taymer)
  }
  if (!javob.ok) {
    const xato = (await javob.json().catch(() => null)) as XatoJavobi | null
    throw new ApiXato(xato?.xato ?? `Server xatosi (${javob.status})`, javob.status)
  }
  return javob.json() as Promise<T>
}

const post = (body?: unknown): RequestInit => ({
  method: 'POST',
  body: body === undefined ? undefined : JSON.stringify(body),
})

export const api = {
  yangiSessiya: () => sorov<BoySessiya>('/api/sessions', post()),
  sessiya: (id: string) => sorov<BoySessiya>(`/api/sessions/${id}`),
  xabar: (id: string, matn: string) =>
    sorov<BoySessiya>(`/api/sessions/${id}/messages`, post({ matn })),
  qadam: (id: string, kalit: string, bajarildi: boolean) =>
    sorov<BoySessiya>(`/api/sessions/${id}/qadamlar/${kalit}`, post({ bajarildi })),
  rozilik: (id: string, rozi: boolean) =>
    sorov<BoySessiya>(`/api/sessions/${id}/rozilik`, post({ rozi })),
  arizalar: () => sorov<BankArizasi[]>('/api/bank/arizalar'),
  ariza: (id: string) => sorov<BankArizasi>(`/api/bank/arizalar/${id}`),
}
