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
      headers: init?.body instanceof FormData ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
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

export const papkaPdfUrl = (id: string) => `${API}/api/sessions/${id}/papka.pdf`
export const bankPapkaPdfUrl = (id: string) => `${API}/api/bank/arizalar/${id}/papka.pdf`

export const api = {
  yangiSessiya: () => sorov<BoySessiya>('/api/sessions', post()),
  sessiya: (id: string) => sorov<BoySessiya>(`/api/sessions/${id}`),
  xabar: (id: string, matn: string) =>
    sorov<BoySessiya>(`/api/sessions/${id}/messages`, post({ matn })),
  rasmliXabar: (id: string, matn: string, rasm: File) => {
    const forma = new FormData()
    forma.append('matn', matn)
    forma.append('rasm', rasm)
    return sorov<BoySessiya>(
      `/api/sessions/${id}/hujjatlar/skrinshot`,
      { method: 'POST', body: forma },
      90_000,
    )
  },
  qadam: (id: string, kalit: string, bajarildi: boolean) =>
    sorov<BoySessiya>(`/api/sessions/${id}/qadamlar/${kalit}`, post({ bajarildi })),
  rozilik: (id: string, rozi: boolean) =>
    sorov<BoySessiya>(`/api/sessions/${id}/rozilik`, post({ rozi })),
  mahsulot: (id: string, kalit: string) =>
    sorov<BoySessiya>(`/api/sessions/${id}/mahsulot`, post({ kalit })),
  hujjatYukla: (id: string, kalit: string, fayl: File) => {
    const forma = new FormData()
    forma.append('fayl', fayl)
    return sorov<BoySessiya>(
      `/api/sessions/${id}/hujjatlar/${kalit}`,
      { method: 'POST', body: forma },
      90_000,
    )
  },
  hujjatOchir: (id: string, kalit: string) =>
    sorov<BoySessiya>(`/api/sessions/${id}/hujjatlar/${kalit}/ochirish`, post()),
  arizalar: () => sorov<BankArizasi[]>('/api/bank/arizalar'),
  ariza: (id: string) => sorov<BankArizasi>(`/api/bank/arizalar/${id}`),
}
