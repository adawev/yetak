// Server va web uchun yagona turlar. Faqat shu yerda o'zgartiriladi.

export type Shakl = "yatt" | "mchj" | "oilaviy" | "xususiy" | "ozini_band" | "norasmiy";

/** Tashkiliy shakl nomi — hamma joyda shu yerdan. */
export const SHAKL_NOMI: Record<Shakl, string> = {
  yatt: "Yakka tartibdagi tadbirkor (YaTT)",
  mchj: "MChJ",
  oilaviy: "Oilaviy korxona",
  xususiy: "Xususiy korxona",
  ozini_band: "O'zini o'zi band qilgan",
  norasmiy: "Ro'yxatdan o'tmagan",
};

/** Qisqa yozuv: korxona nomidan keyin ("«Non uyi» MChJ"). */
export const SHAKL_QISQA: Partial<Record<Shakl, string>> = { mchj: "MChJ", oilaviy: "OK", xususiy: "XK" };

/** Yuridik shaxs (korxona): MChJ, oilaviy korxona, xususiy korxona. */
export const yuridikShaxs = (s?: Shakl | null): boolean => s === "mchj" || s === "oilaviy" || s === "xususiy";
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
  // Qoralamalar uchun (hukmga ta'sir qilmaydi; bank tanlangach so'raladi)
  ism?: string; // F.I.Sh. — YaTT egasi yoki MChJ rahbari
  korxona_nomi?: string; // MChJ nomi
  stir?: string; // 9 xonali STIR (ixtiyoriy)
  ishtirokchilar?: "yagona" | "bir_nechta"; // MChJ ishtirokchilari
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

export type ShartHolati = "ha" | "yoq" | "nomalum";

/** Bitta bank mahsulotining tadbirkor profiliga mosligi. Hisobni server (mahsulotlar.ts) qiladi. */
export interface MahsulotMoslik {
  kalit: string;
  bank: string;
  nom: string;
  /** Qisqa shartlar: "300 mln gacha · 18–24% · 84 oygacha" */
  qisqa: string;
  /** Har shart profil bilan solishtirilgan: ha ✓, yoq ✗, nomalum ? */
  shartlar: { matn: string; holat: ShartHolati }[];
  /** mos — hamma shart ✓; qisman — ✗ yo'q, lekin ? bor; mos_emas — kamida bitta ✗ */
  mos: "mos" | "qisman" | "mos_emas";
  /**
   * Shu bankdan tadbirkorga taxminiy taklif — kod hisoblaydi (mahsulot chegaralari va bank foizi bilan).
   * null — mahsulot mos emas yoki foiz manbada yo'q.
   */
  taklif: {
    /** Olsa bo'ladigan summa: so'ragani yoki mahsulot chegarasi (qaysi kichik bo'lsa) */
    summa: number;
    /** Bank e'lon qilgan foiz oralig'i, yillik */
    foiz_min: number;
    foiz_max: number;
    /** Muddat, oy: so'ragani yoki mahsulot chegarasi */
    muddat_oy: number;
    /** Foizga izoh (masalan, foiz faqat summaning bir qismiga tegishli). null — izoh yo'q */
    izoh: string | null;
        /** Oylik to'lov — yuqori foiz bilan (ehtiyotkor hisob), annuitet */
    oylik_tolov: number;
    /** Oylik to'lov foydaning necha foizi (kod hisoblaydi). null — foyda noma'lum */
    foyda_ulushi: number | null;
  } | null;
  /** Tadbirkor o'zi olib boradigan hujjatlar */
  hujjatlar: string[];
  /** Bank davlat tizimi yoki o'z tizimidan o'zi tekshiradi (manbada aytilganlari) */
  bank_tekshiradi: string[];
  manba: Manba;
}

/** Hujjatni qanday olish — tekshirilgan yo'riqnoma (docs/tadqiqot/hujjatlar.json). */
export interface OlishYoli {
  /** "my.gov.uz", "«Soliq» ilovasi", "bankning o'zi" */
  qayerda: string;
  /** Saytdagi qidiruvga yoziladigan xizmat nomi */
  qidiruv: string | null;
  qadamlar: string[];
  /** "2 daqiqa", "1 ish kuni" */
  vaqt: string | null;
  /** "bepul", "BHM ning 0,03 barobari" */
  narx: string | null;
  eri_kerak: boolean | null;
  /** Xizmat sahifasi — bosganda ochiladi */
  havola: string | null;
  /** Shu yo'lni tasdiqlovchi manba */
  manba: string | null;
}

/** Yuklangan hujjatni sun'iy intellekt o'qib chiqqani. Hujjat o'zgartirilmaydi. */
export interface HujjatTekshiruvi {
  /** mos — kutilgan hujjat, o'qiladi, muammo topilmadi */
  holat: "mos" | "muammo";
  /** AI hujjatni nima deb tanidi: "Pasport", "Ijara shartnomasi" */
  hujjat_turi: string;
  /** Hujjatdagi egasining ismi (ko'rinsa) — hujjatlar orasidagi mosligini tekshirish uchun */
  egasi: string | null;
  /** Oddiy o'zbekcha, har biri bir gap */
  muammolar: string[];
  /** Bir gapli xulosa */
  izoh: string;
}

export interface YuklanganFayl {
  nom: string;
  /** MIME: image/jpeg, image/png, image/webp, application/pdf */
  tur: string;
  hajm: number;
  vaqt: string; // ISO
  /** null — tekshirib bo'lmadi (AI javob bermadi); fayl baribir papkaga kiradi */
  tekshiruv: HujjatTekshiruvi | null;
}

/** Tanlangan bank mahsuloti uchun bitta hujjat. */
export interface PapkaHujjat {
  kalit: string;
  nom: string;
  /** Qachon kerak: "MChJ bo'lsa", "100 mln dan oshgan qismi uchun". null — har doim */
  shart: string | null;
  /** true — bank o'zi davlat tizimidan oladi, olib borish shart emas */
  bank_ozi_oladi: boolean;
  /** true — bank so'ramaydi, lekin ariza berishdan oldin o'zingiz tekshirib oling (masalan, kredit tarixi) */
  tavsiya: boolean;
  olish: OlishYoli | null;
  fayl: YuklanganFayl | null;
  /** Yetak bu hujjatning qoralamasini tadbirkor aytgan raqamlardan o'zi tayyorlaydi (PDF papkada bor). Matn — tadbirkorga izoh. */
  qoralama: string | null;
  /** Qoralama bankda haqiqatda qanday o'tadi — manbali izoh (qoralama bo'lsa). */
  qoralama_asos?: { matn: string; manba: string | null } | null;
}

/** Hujjatlar papkasi: tanlangan mahsulot, kerakli hujjatlar va yuklanganlari. */
export interface Papka {
  mahsulot: { kalit: string; bank: string; nom: string };
  hujjatlar: PapkaHujjat[];
  /** Olib boriladigan (bank o'zi olmaydigan, tavsiya emas) hujjatlardan tekshiruvdan o'tganlari */
  tayyor: number;
  jami: number;
  /** Hujjatlar orasidagi nomuvofiqlik: "Pasport va ijara shartnomasidagi ismlar farq qiladi" */
  ogohlantirishlar: string[];
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
  | { tur: "atama"; atama: string; izoh: string }
  | { tur: "mahsulotlar"; mahsulotlar: MahsulotMoslik[] }
  /** Sessiyaning joriy `papka` sidan chiziladi */
  | { tur: "hujjatlar" };

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
  /** Tadbirkor xabarga ekran rasmini (skrinshot) qo'shgan. Rasmning o'zi saqlanmaydi. */
  rasm?: boolean;
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
  /** Tekshirilgan bank mahsulotlariga moslik (shakl va summa ma'lum bo'lganda), eng mosi birinchi. */
  mahsulotlar?: MahsulotMoslik[];
  /** Hujjatlar papkasi. Mahsulot tanlanmaguncha (shakl va summa noma'lum) null. */
  papka?: Papka | null;
  /** Tadbirkor bankni o'zi tanladimi (tanlamagan bo'lsa papka eng mos bank bo'yicha). */
  bank_tanlangan?: boolean;
}

export interface BankArizasi {
  id: string;
  yangilangan: string; // ISO
  profil: Profil;
  natija: Natija;
  papka?: Papka | null;
}

export interface XatoJavobi {
  xato: string; // foydalanuvchiga ko'rsatiladigan haqiqiy sabab, o'zbekcha
}

// ── Kabinetlar: login, hamkor banklar, ariza holati, hisobot ──

export type Rol = "tadbirkor" | "bank" | "admin";

/** Foydalanuvchining ochiq ko'rinishi (parol va token hech qachon qaytarilmaydi). */
export interface Foydalanuvchi {
  id: string;
  ism: string;
  telefon: string;
  rol: Rol;
  /** Faqat rol "bank" bo'lsa */
  bank_id?: string;
  yaratilgan: string;
}

export interface KirishJavobi {
  token: string;
  foydalanuvchi: Foydalanuvchi;
}

/** Tadbirkor kabineti: o'z suhbatlari */
export interface MeningSuhbatim {
  id: string;
  yangilangan: string;
  faoliyat?: string;
  kredit_summa?: number;
  hukm: Hukm | null;
  bank_roziligi: boolean;
}

export interface MenJavobi {
  foydalanuvchi: Foydalanuvchi;
  suhbatlar: MeningSuhbatim[];
}

export type Shartnoma = "faol" | "muzokarada" | "toxtatilgan";

/** Hamkor bank. Yetak tadbirkordan pul olmaydi — bank berilgan kredit uchun komissiya to'laydi. */
export interface HamkorBank {
  id: string;
  nom: string;
  shartnoma: Shartnoma;
  /** Berilgan kredit summasidan foiz */
  komissiya_foiz: number;
  yaratilgan: string;
  xodimlar: Foydalanuvchi[];
}

export type ArizaHolati = "yangi" | "korilmoqda" | "berildi" | "rad";

export interface ArizaQarori {
  holat: ArizaHolati;
  /** "berildi" bo'lsa — bank bergan summa */
  summa?: number;
  /** "rad" bo'lsa — sabab */
  sabab?: string;
  /** Hisoblangan komissiya (server: summa × komissiya_foiz) */
  komissiya?: number;
  yangilangan: string;
}

/** Bank xodimi ko'radigan ariza: tadbirkor profili + shu bankning qarori */
export interface BankArizasiHolat extends BankArizasi {
  qaror: ArizaQarori;
}

export interface BankHisobi {
  bank: { id: string; nom: string; komissiya_foiz: number; shartnoma: Shartnoma };
  jami: number;
  holatlar: Record<ArizaHolati, number>;
  berilgan_summa: number;
  komissiya: number;
}

export interface AdminHisobot {
  foydalanuvchilar: Record<Rol, number>;
  suhbatlar: {
    jami: number;
    tugallangan: number;
    hukmlar: Record<Hukm, number>;
    rozilik: number;
  };
  /** Oxirgi 7 kun: [sana "YYYY-MM-DD", yangi suhbatlar] */
  kunlik: { sana: string; soni: number }[];
  banklar: {
    id: string;
    nom: string;
    shartnoma: Shartnoma;
    komissiya_foiz: number;
    holatlar: Record<ArizaHolati, number>;
    berilgan_summa: number;
    komissiya: number;
  }[];
  jami: { berilgan_kredit: number; berilgan_summa: number; daromad: number };
}
