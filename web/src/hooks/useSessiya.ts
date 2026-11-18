import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { BoySessiya } from '@/lib/bloklar'
import { hujjatniTayyorla } from '@/lib/rasm'

const KALIT = 'yetak.sessiya_id'

const xatoMatni = (e: unknown) => (e instanceof Error ? e.message : 'Nimadir xato ketdi.')
const xatoHolati = (e: unknown) => (e as { status?: number } | null)?.status

function idSaqla(id: string | null) {
  try {
    if (id) localStorage.setItem(KALIT, id)
    else localStorage.removeItem(KALIT)
  } catch {
    /* saqlab bo'lmasa ham ishlayveradi */
  }
}

export function useSessiya() {
  const [holat, setHolat] = useState<BoySessiya | null>(null)
  const [yuklanmoqda, setYuklanmoqda] = useState(true)
  const [yuborilmoqda, setYuborilmoqda] = useState(false)
  /** Yuborilgan, lekin hali javob kelmagan xabar (darhol ko'rsatiladi). */
  const [kutilayotgan, setKutilayotgan] = useState<string | null>(null)
  /** Yuborilmay qolgan xabar — qayta urinish uchun. */
  const [yuborilmagan, setYuborilmagan] = useState<string | null>(null)
  const [xato, setXato] = useState<string | null>(null)
  const band = useRef(false)
  /** Hozir tekshirilayotgan hujjatlar (kalit bo'yicha). */
  const [yuklanayotgan, setYuklanayotgan] = useState<Record<string, boolean>>({})
  const [hujjatXatolari, setHujjatXatolari] = useState<Record<string, string>>({})

  const yangiSuhbat = useCallback(async () => {
    setYuklanmoqda(true)
    setXato(null)
    setYuborilmagan(null)
    try {
      const h = await api.yangiSessiya()
      idSaqla(h.id)
      setHolat(h)
    } catch (e) {
      setXato(xatoMatni(e))
    } finally {
      setYuklanmoqda(false)
    }
  }, [])

  const boshla = useCallback(async () => {
    let id: string | null = null
    try {
      id = localStorage.getItem(KALIT)
    } catch {
      /* yo'q */
    }
    if (!id) return yangiSuhbat()
    setYuklanmoqda(true)
    setXato(null)
    try {
      setHolat(await api.sessiya(id))
      setYuklanmoqda(false)
    } catch (e) {
      if (xatoHolati(e) === 404) return yangiSuhbat()
      setXato(xatoMatni(e))
      setYuklanmoqda(false)
    }
  }, [yangiSuhbat])

  // StrictMode effektni ikki marta chaqiradi — sessiya ikki marta ochilmasin
  const boshlandi = useRef(false)
  useEffect(() => {
    if (boshlandi.current) return
    boshlandi.current = true
    void boshla()
  }, [boshla])

  const yubor = useCallback(
    async (matn: string) => {
      const t = matn.trim()
      if (!t || !holat || band.current) return
      band.current = true
      setYuborilmoqda(true)
      setKutilayotgan(t)
      setYuborilmagan(null)
      setXato(null)
      try {
        setHolat(await api.xabar(holat.id, t))
      } catch (e) {
        setYuborilmagan(t)
        setXato(xatoMatni(e))
      } finally {
        band.current = false
        setKutilayotgan(null)
        setYuborilmoqda(false)
      }
    },
    [holat],
  )

  const qadamBelgila = useCallback(
    async (kalit: string, bajarildi: boolean) => {
      if (!holat?.natija) return
      const oldingi = holat
      // Darhol ko'rsatamiz, xato bo'lsa qaytaramiz
      setHolat({
        ...holat,
        natija: {
          ...holat.natija,
          qadamlar: holat.natija.qadamlar.map((q) => (q.kalit === kalit ? { ...q, bajarildi } : q)),
        },
      })
      try {
        setHolat(await api.qadam(holat.id, kalit, bajarildi))
      } catch (e) {
        setHolat(oldingi)
        setXato(xatoMatni(e))
      }
    },
    [holat],
  )

  const rozilikBer = useCallback(
    async (rozi: boolean) => {
      if (!holat) return
      try {
        setHolat(await api.rozilik(holat.id, rozi))
      } catch (e) {
        setXato(xatoMatni(e))
      }
    },
    [holat],
  )

  const hujjatXatosi = (kalit: string, matn: string | null) =>
    setHujjatXatolari((x) => {
      const y = { ...x }
      if (matn) y[kalit] = matn
      else delete y[kalit]
      return y
    })

  const hujjatYukla = useCallback(
    async (kalit: string, fayl: File) => {
      if (!holat) return
      hujjatXatosi(kalit, null)
      setYuklanayotgan((y) => ({ ...y, [kalit]: true }))
      try {
        setHolat(await api.hujjatYukla(holat.id, kalit, await hujjatniTayyorla(fayl)))
      } catch (e) {
        hujjatXatosi(kalit, xatoMatni(e))
      } finally {
        setYuklanayotgan((y) => ({ ...y, [kalit]: false }))
      }
    },
    [holat],
  )

  const hujjatOchir = useCallback(
    async (kalit: string) => {
      if (!holat) return
      hujjatXatosi(kalit, null)
      setYuklanayotgan((y) => ({ ...y, [kalit]: true }))
      try {
        setHolat(await api.hujjatOchir(holat.id, kalit))
      } catch (e) {
        hujjatXatosi(kalit, xatoMatni(e))
      } finally {
        setYuklanayotgan((y) => ({ ...y, [kalit]: false }))
      }
    },
    [holat],
  )

  const mahsulotTanla = useCallback(
    async (kalit: string) => {
      if (!holat) return
      try {
        setHolat(await api.mahsulot(holat.id, kalit))
      } catch (e) {
        setXato(xatoMatni(e))
      }
    },
    [holat],
  )

  return {
    holat,
    hujjatAmallari: {
      yuklanayotgan,
      xatolar: hujjatXatolari,
      onYukla: (k: string, f: File) => void hujjatYukla(k, f),
      onOchir: (k: string) => void hujjatOchir(k),
      onXato: hujjatXatosi,
      onMahsulot: (k: string) => void mahsulotTanla(k),
    },
    yuklanmoqda,
    yuborilmoqda,
    kutilayotgan,
    yuborilmagan,
    xato,
    yubor,
    qadamBelgila,
    rozilikBer,
    yangiSuhbat,
    qaytaYukla: boshla,
    xatoniYop: () => setXato(null),
  }
}

export type Sessiya = ReturnType<typeof useSessiya>
