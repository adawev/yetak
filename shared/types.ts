// Server va web uchun yagona turlar. Faqat shu yerda o'zgartiriladi.

export type Shakl = "yatt" | "mchj" | "ozini_band" | "norasmiy";
export type KreditTarixi = "yaxshi" | "yomon" | "yoq";

/** Tadbirkor holati. Agent suhbat davomida to'ldiradi. Pul — so'mda. */
export interface Profil {
  faoliyat?: string; // masalan "tikuv sexi"
  shakl?: Shakl;
  faoliyat_oy?: number; // necha oydan beri ishlaydi
  oylik_tushum?: number;
  oylik_xarajat?: number;
  kredit_summa?: number;
  kredit_muddat_oy?: number;
  maqsad?: string; // pul nimaga kerak
  garov_qiymati?: number; // garov yo'q bo'lsa 0
  kredit_tarixi?: KreditTarixi;
  avval_mikrokredit?: boolean; // ilgari mikrokredit olib, vaqtida qaytarganmi
  eri_bor?: boolean; // elektron imzo
}

export const PROFIL_MAYDONLARI: (keyof Profil)[] = [
  "faoliyat",
  "shakl",
  "faoliyat_oy",
  "oylik_tushum",
  "oylik_xarajat",
  "kredit_summa",
  "kredit_muddat_oy",
  "maqsad",
  "garov_qiymati",
  "kredit_tarixi",
  "avval_mikrokredit",
  "eri_bor",
];

export type Hukm = "tayyor" | "hali_emas" | "olmang";

export interface Manba {
  nom: string;
  url: string;
}

/** Bitta tekshiruv natijasi. */
export interface Topilma {
  kalit: string;
  daraja: "yaxshi" | "ogohlantirish" | "tosiq";
  matn: string;
  manba?: Manba;
  /** true bo'lsa: bu bizning hisobimiz yoki taxmin, bank bilan tasdiqlanmagan. */
  taxmin?: boolean;
}

/** Yo'l xaritasidagi bitta qadam. */
export interface Qadam {
  kalit: string;
  sarlavha: string;
  izoh: string;
  manba?: Manba;
  bajarildi: boolean;
}

export interface Hisob {
  oylik_foyda: number;
  oylik_tolov: number;
  yillik_stavka: number; // foiz, taxminiy
  kerakli_garov: number;
}

export interface Natija {
  hukm: Hukm;
  xulosa: string;
  topilmalar: Topilma[];
  qadamlar: Qadam[];
  hisob: Hisob;
}

/**
 * Chat ichidagi boy blok. Agent qaysi blokni ko'rsatishni tanlaydi,
 * raqamlarni server profil va rules.ts dan qo'yadi.
 * `hukm` va `yol_xaritasi` sessiyaning joriy `natija` sidan chiziladi.
 */
export type Blok =
  | { tur: "summa"; sarlavha: string; qiymat: number }
  | { tur: "pul_oqimi"; tushum: number; xarajat: number; foyda: number; tolov: number }
  | { tur: "garov"; bor: number; kerak: number }
  | { tur: "hukm" }
  | { tur: "yol_xaritasi" }
  | { tur: "atama"; atama: string; izoh: string };

/** Agent javobi tayangan manba (Claude citations). `parcha` — manbadan aynan keltirilgan matn. */
export interface Iqtibos {
  nom: string;
  url: string;
  parcha?: string;
}

export interface Xabar {
  kim: "agent" | "tadbirkor";
  matn: string;
  vaqt: string; // ISO
  bloklar?: Blok[];
  manbalar?: Iqtibos[];
}

/** Sessiyaning to'liq ko'rinishi (GET /api/sessions/:id va xabar javobi). */
export interface SessiyaHolati {
  id: string;
  xabarlar: Xabar[];
  profil: Profil;
  /** Profil to'liq bo'lmaguncha null. */
  natija: Natija | null;
  /** Agent taklif qilgan tugmali javoblar (oxirgi xabar uchun), bo'lmasa []. */
  tugmalar: string[];
  /** To'ldirilgan maydonlar soni va jami (jarayon ko'rsatkichi uchun). */
  jarayon: { toldirilgan: number; jami: number };
  /** Tadbirkor ma'lumotini bankka ko'rsatishga rozilik berganmi. */
  bank_roziligi: boolean;
}

export interface BankArizasi {
  id: string;
  yangilangan: string; // ISO
  profil: Profil;
  natija: Natija;
}

export interface XatoJavobi {
  xato: string; // foydalanuvchiga ko'rsatiladigan haqiqiy sabab, o'zbekcha
}
