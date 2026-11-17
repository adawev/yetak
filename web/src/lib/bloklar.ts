import type { SessiyaHolati, Xabar } from '@shared/types'

/**
 * TAKLIF — shared/types.ts ga qo'shilishi kerak (sardor bilan kelishilmagan).
 * Agent qaysi blokni ko'rsatishni tanlaydi; raqamlarni server qoidalardan qo'yadi.
 * `hukm` va `yol_xaritasi` sessiyaning joriy `natija` sidan chiziladi.
 */
export type Blok =
  | { tur: 'summa'; sarlavha: string; qiymat: number }
  | { tur: 'pul_oqimi'; tushum: number; xarajat: number; foyda: number; tolov: number }
  | { tur: 'garov'; bor: number; kerak: number }
  | { tur: 'hukm' }
  | { tur: 'yol_xaritasi' }
  | { tur: 'atama'; atama: string; izoh: string }

/**
 * TAKLIF — agent javobi tayangan manba (Claude citations'dan).
 * `parcha` — manbadan aynan keltirilgan matn (`cited_text`).
 */
export interface Iqtibos {
  nom: string
  url: string
  parcha?: string
}

export type BoyXabar = Xabar & { id?: string; bloklar?: Blok[]; manbalar?: Iqtibos[] }

export type BoySessiya = Omit<SessiyaHolati, 'xabarlar'> & { xabarlar: BoyXabar[] }
