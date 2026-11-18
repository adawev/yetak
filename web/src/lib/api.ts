import type {
  AdminHisobot,
  ArizaHolati,
  BankArizasiHolat,
  BankHisobi,
  HamkorBank,
  KirishJavobi,
  MenJavobi,
  Shartnoma,
  XatoJavobi,
} from '@shared/types'
import type { BoySessiya } from '@/lib/bloklar'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

const TOKEN = 'yetak.token'

export function tokenOl(): string | null {
  try {
    return localStorage.getItem(TOKEN)
  } catch {
    return null
  }
}

export function tokenSaqla(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN, t)
    else localStorage.removeItem(TOKEN)
  } catch {
    /* saqlab bo'lmasa — faqat shu oynada kirilgan bo'ladi */
  }
}

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
      headers: {
        // FormData (fayl yuklash) — Content-Type ni brauzer o'zi qo'yadi
        ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(tokenOl() ? { Authorization: `Bearer ${tokenOl()}` } : {}),
        ...init?.headers,
      },
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

  // Login
  royxat: (p: { ism: string; telefon: string; parol: string; sessiya_id?: string }) =>
    sorov<KirishJavobi>('/api/auth/register', post(p)),
  kirish: (p: { telefon: string; parol: string; sessiya_id?: string }) =>
    sorov<KirishJavobi>('/api/auth/login', post(p)),
  chiqish: () => sorov<{ ok: true }>('/api/auth/logout', post()),
  men: () => sorov<MenJavobi>('/api/auth/me'),
  biriktir: (sessiya_id: string) => sorov<MenJavobi>('/api/auth/attach', post({ sessiya_id })),

  // Bank oynasi
  arizalar: () => sorov<BankArizasiHolat[]>('/api/bank/applications'),
  ariza: (id: string) => sorov<BankArizasiHolat>(`/api/bank/applications/${id}`),
  qaror: (id: string, p: { holat: ArizaHolati; summa?: number; sabab?: string }) =>
    sorov<BankArizasiHolat>(`/api/bank/applications/${id}/decision`, post(p)),
  bankHisob: () => sorov<BankHisobi>('/api/bank/stats'),

  // Admin
  banklar: () => sorov<HamkorBank[]>('/api/admin/banks'),
  bankYarat: (p: { nom: string; shartnoma: Shartnoma; komissiya_foiz: number }) =>
    sorov<HamkorBank>('/api/admin/banks', post(p)),
  bankYangila: (id: string, p: Partial<{ nom: string; shartnoma: Shartnoma; komissiya_foiz: number }>) =>
    sorov<HamkorBank>(`/api/admin/banks/${id}`, post(p)),
  xodimQosh: (bankId: string, p: { ism: string; telefon: string; parol: string }) =>
    sorov<HamkorBank>(`/api/admin/banks/${bankId}/staff`, post(p)),
  hisobot: () => sorov<AdminHisobot>('/api/admin/report'),
  /** Bank xodimi uchun papka PDF: login tokeni bilan yuklab, yangi oynada ochadi. */
  bankPapkaOch: async (id: string) => {
    const t = tokenOl()
    const j = await fetch(`${API}/api/bank/applications/${id}/papka.pdf`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    })
    if (!j.ok) {
      const x = (await j.json().catch(() => null)) as { xato?: string } | null
      throw new ApiXato(x?.xato ?? 'Papkani ochib bo\'lmadi. Qayta urinib ko\'ring.', j.status)
    }
    const url = URL.createObjectURL(await j.blob())
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  },
}
