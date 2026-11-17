// Soxta API: haqiqiy API bilan bir xil ko'rinish. VITE_MOCK=1 bo'lganda ishlaydi.
// Profil qiymatlari tadbirkorning javobidan emas, tanlangan ssenariydan olinadi.
import { PROFIL_MAYDONLARI, type BankArizasi, type Profil } from '@shared/types'
import type { Blok, BoySessiya } from '@/lib/bloklar'
import { qisqaSom } from '@/lib/format'
import { SSENARIYLAR, type SsenariyNomi } from './ssenariylar'

interface Savol {
  maydon: keyof Profil
  matn: string
  tugmalar: (p: Required<Profil>) => string[]
  bloklar?: Blok[]
}

const SAVOLLAR: Savol[] = [
  { maydon: 'faoliyat', matn: 'Qanday ish bilan shug‘ullanasiz?', tugmalar: (p) => [p.faoliyat] },
  {
    maydon: 'shakl',
    matn: 'Biznesingiz qanday ro‘yxatdan o‘tgan?',
    tugmalar: () => ['YaTT', 'MChJ', "O'zini o'zi band qilgan", "Ro'yxatdan o'tmagan"],
    bloklar: [{ tur: 'atama', atama: 'YaTT', izoh: 'Yakka tartibdagi tadbirkor — o‘z nomingizdan ishlaysiz.' }],
  },
  { maydon: 'faoliyat_oy', matn: 'Necha oydan beri ishlayapsiz?', tugmalar: (p) => [`${p.faoliyat_oy} oy`] },
  { maydon: 'oylik_tushum', matn: 'Bir oyda o‘rtacha qancha **tushum** bo‘ladi?', tugmalar: (p) => [qisqaSom(p.oylik_tushum)] },
  { maydon: 'oylik_xarajat', matn: 'Oyiga qancha **xarajat** qilasiz? (ijara, xom ashyo, ish haqi)', tugmalar: (p) => [qisqaSom(p.oylik_xarajat)] },
  { maydon: 'kredit_summa', matn: 'Qancha pul kerak?', tugmalar: (p) => [qisqaSom(p.kredit_summa)] },
  { maydon: 'kredit_muddat_oy', matn: 'Necha oyda qaytarmoqchisiz?', tugmalar: (p) => [`${p.kredit_muddat_oy} oy`] },
  { maydon: 'maqsad', matn: 'Pul nimaga ishlatiladi?', tugmalar: (p) => [p.maqsad] },
  {
    maydon: 'garov_qiymati',
    matn: 'Garovga qo‘ya oladigan mol-mulkingiz bormi? Bo‘lsa, taxminan qancha turadi?',
    tugmalar: (p) => (p.garov_qiymati ? [qisqaSom(p.garov_qiymati)] : ["Yo'q"]),
    bloklar: [{ tur: 'atama', atama: 'Garov', izoh: 'Qarzni qaytarmasangiz bank oladigan mol-mulk: uy, mashina, uskuna.' }],
  },
  { maydon: 'kredit_tarixi', matn: 'Ilgari kredit olganmisiz? Vaqtida to‘laganmisiz?', tugmalar: () => ['Yaxshi', 'Kechiktirganman', "Kredit olmaganman"] },
  { maydon: 'avval_mikrokredit', matn: 'Ilgari mikrokredit olib, vaqtida qaytarganmisiz?', tugmalar: () => ['Ha', "Yo'q"] },
  {
    maydon: 'eri_bor',
    matn: 'Elektron imzongiz bormi?',
    tugmalar: () => ['Ha', "Yo'q", 'Bilmayman'],
    bloklar: [{ tur: 'atama', atama: 'Elektron imzo (ERI)', izoh: 'Hujjatni internet orqali imzolash uchun kalit. Onlayn ariza uchun kerak.' }],
  },
]

/** Javobdan keyin ko'rsatiladigan bloklar (tasdiqlash va diagrammalar). */
function javobBloklari(maydon: keyof Profil, s: (typeof SSENARIYLAR)[SsenariyNomi]): Blok[] {
  const p = s.profil
  const h = s.natija.hisob
  switch (maydon) {
    case 'oylik_tushum':
      return [{ tur: 'summa', sarlavha: 'Oylik tushum', qiymat: p.oylik_tushum }]
    case 'kredit_summa':
      return [{ tur: 'summa', sarlavha: 'Kerakli summa', qiymat: p.kredit_summa }]
    case 'kredit_muddat_oy':
      return [{ tur: 'pul_oqimi', tushum: p.oylik_tushum, xarajat: p.oylik_xarajat, foyda: h.oylik_foyda, tolov: h.oylik_tolov }]
    case 'garov_qiymati':
      return [{ tur: 'garov', bor: p.garov_qiymati, kerak: h.kerakli_garov }]
    default:
      return []
  }
}

interface Yozuv {
  holat: BoySessiya
  savol: number
  ssenariy: SsenariyNomi
}

const KALIT = 'yetak.mock'
const yukla = (): Record<string, Yozuv> => {
  try {
    return JSON.parse(localStorage.getItem(KALIT) ?? '{}')
  } catch {
    return {}
  }
}
const saqla = (d: Record<string, Yozuv>) => localStorage.setItem(KALIT, JSON.stringify(d))
const kut = (ms: number) => new Promise((r) => setTimeout(r, ms))
const hozir = () => new Date().toISOString()
const nusxa = <T,>(x: T): T => structuredClone(x)

function ol(id: string): Yozuv {
  const y = yukla()[id]
  if (!y) throw Object.assign(new Error('Sessiya topilmadi'), { status: 404 })
  return y
}
function yangila(y: Yozuv) {
  const d = yukla()
  d[y.holat.id] = y
  saqla(d)
  return nusxa(y.holat)
}

function savolBer(y: Yozuv, oldingi: Blok[] = [], kirish = '') {
  const s = SSENARIYLAR[y.ssenariy]
  const savol = SAVOLLAR[y.savol]
  // Avval javobni tasdiqlovchi bloklar, keyin yangi savol
  if (oldingi.length) {
    y.holat.xabarlar.push({ id: crypto.randomUUID(), kim: 'agent', matn: 'Yozib oldim:', vaqt: hozir(), bloklar: oldingi })
  }
  y.holat.xabarlar.push({
    id: crypto.randomUUID(),
    kim: 'agent',
    matn: `${kirish}${savol.matn}`,
    vaqt: hozir(),
    bloklar: savol.bloklar,
  })
  y.holat.tugmalar = savol.tugmalar(s.profil)
}

export const mockApi = {
  async yangiSessiya() {
    await kut(600)
    const param = new URLSearchParams(location.search).get('ssenariy') as SsenariyNomi | null
    const ssenariy: SsenariyNomi = param && param in SSENARIYLAR ? param : 'hali_emas'
    const y: Yozuv = {
      ssenariy,
      savol: 0,
      holat: {
        id: crypto.randomUUID().slice(0, 8),
        xabarlar: [],
        profil: {},
        natija: null,
        tugmalar: [],
        jarayon: { toldirilgan: 0, jami: PROFIL_MAYDONLARI.length },
        bank_roziligi: false,
      },
    }
    savolBer(
      y,
      [],
      'Assalomu alaykum! Men **Yetak** — kreditgacha yo‘lingizni birga topamiz.\n\nBir nechta savol beraman, bittadan. Javob bilmasangiz, «Bilmayman» deng.\n\n',
    )
    return yangila(y)
  },

  async sessiya(id: string) {
    await kut(300)
    return nusxa(ol(id).holat)
  },

  async xabar(id: string, matn: string) {
    const y = ol(id)
    await kut(1200 + Math.random() * 1500)
    const s = SSENARIYLAR[y.ssenariy]
    y.holat.xabarlar.push({ id: crypto.randomUUID(), kim: 'tadbirkor', matn, vaqt: hozir() })

    if (y.savol >= SAVOLLAR.length) {
      y.holat.xabarlar.push({
        id: crypto.randomUUID(),
        kim: 'agent',
        matn: 'Namuna rejimi: bu yerda agent savolingizga javob beradi. Yo‘l xaritangiz:',
        vaqt: hozir(),
        bloklar: [{ tur: 'yol_xaritasi' }],
      })
      y.holat.tugmalar = []
      return yangila(y)
    }

    const maydon = SAVOLLAR[y.savol].maydon
    ;(y.holat.profil as Record<string, unknown>)[maydon] = s.profil[maydon]
    y.holat.jarayon.toldirilgan = y.savol + 1
    const bloklar = javobBloklari(maydon, s)
    y.savol++

    if (y.savol < SAVOLLAR.length) {
      savolBer(y, bloklar)
    } else {
      y.holat.natija = nusxa(s.natija)
      y.holat.xabarlar.push({
        id: crypto.randomUUID(),
        kim: 'agent',
        matn: 'Rahmat! Holatingizni tekshirdim. Mana natija:',
        vaqt: hozir(),
        bloklar: [{ tur: 'hukm' }, { tur: 'yol_xaritasi' }],
      })
      y.holat.tugmalar = ['Birinchi qadam nima?', 'Nega shunday?']
    }
    return yangila(y)
  },

  async qadam(id: string, kalit: string, bajarildi: boolean) {
    const y = ol(id)
    await kut(300)
    const q = y.holat.natija?.qadamlar.find((x) => x.kalit === kalit)
    if (q) q.bajarildi = bajarildi
    return yangila(y)
  },

  async rozilik(id: string, rozi: boolean) {
    const y = ol(id)
    await kut(300)
    y.holat.bank_roziligi = rozi
    return yangila(y)
  },

  async arizalar(): Promise<BankArizasi[]> {
    await kut(400)
    return Object.values(yukla())
      .filter((y) => y.holat.bank_roziligi && y.holat.natija)
      .map((y) => ({
        id: y.holat.id,
        yangilangan: y.holat.xabarlar.at(-1)?.vaqt ?? hozir(),
        profil: y.holat.profil,
        natija: y.holat.natija!,
      }))
  },

  async ariza(id: string): Promise<BankArizasi> {
    const a = (await mockApi.arizalar()).find((x) => x.id === id)
    if (!a) throw Object.assign(new Error('Ariza topilmadi'), { status: 404 })
    return a
  },
}
