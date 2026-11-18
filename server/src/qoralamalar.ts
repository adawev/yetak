// Yetak o'zi to'ldiradigan hujjat qoralamalari: tadbirkor suhbatda aytgan ma'lumot + kod hisoblagan raqamlar.
// Bitta joy: papka (qaysi hujjatda qoralama bor) ham, PDF (sahifa matni) ham shu yerdan oladi.
// Demo farazi (QARORLAR.md, 2026-11-18): bank shaklini Yetak oladi va shu maydonlarni unga ko'chiradi.
// Bank qoidasi o'ylab topilmaydi — qoralamada faqat tadbirkor aytgani va hisob.

import type { Profil } from "../../shared/types";
import { biznesToifasi, kreditTolovi, somda } from "./rules";

export type QoralamaKalit = "ariza" | "tasischi_qarori" | "daromad_manbalari" | "pul_oqimi";

export const QORALAMA_MATNI: Record<QoralamaKalit, string> = {
  ariza: "Yetak sizning javoblaringizdan to'ldirdi — tekshirib, imzolaysiz.",
  tasischi_qarori: "Yetak qaror matnini tayyorladi — ta'sischilar imzolaydi, muhr bosiladi.",
  daromad_manbalari: "Yetak siz aytgan tushum va xarajatdan to'ldirdi — tekshirib, imzolaysiz.",
  pul_oqimi: "Yetak siz aytgan raqamlardan 12 oylik jadval tuzdi — tekshirib, imzolaysiz.",
};

/**
 * Qoralama bankda haqiqatda qanday o'tadi (2026-11-18 tekshirildi). Tadbirkorga ham, PDF ga ham shu yozuv chiqadi.
 * Manbasiz da'vo yo'q: topilmagan narsa «bank shakliga ko'chiriladi» deb halol aytiladi.
 */
export const QORALAMA_ASOSI: Record<QoralamaKalit, { matn: string; manba: string | null }> = {
  ariza: {
    matn: "Bank arizani o'z shaklida so'raydi (Hamkorbankda — «buyurtmanoma»). Yetak barcha ma'lumotni tayyorlab qo'ydi — bank shakliga ko'chiriladi. Demoda — Yetak namunasi.",
    manba: "https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf",
  },
  tasischi_qarori: {
    matn: "MChJ qonuni (O'RQ-1137): yirik bitimni ishtirokchilar umumiy yig'ilishi hal qiladi; bayonnomada vaqt va joy, ovozlar, rais va kotib, kun tartibi va qaror bo'ladi. Notarius shart emas. Hamkorbank «boshqaruv organining kredit olish uchun roziligi» ni so'raydi.",
    manba: "https://lex.uz/uz/docs/-8151376",
  },
  pul_oqimi: {
    matn: "Hamkorbank «o'zini o'zi qoplashi ko'rsatilgan pul oqimlari prognozi» ni so'raydi — jadval kredit to'lovi foydadan qoplanishini oyma-oy ko'rsatadi. Bankda o'z shakli bo'lsa, raqamlar ko'chiriladi.",
    manba: "https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf",
  },
  daromad_manbalari: {
    matn: "Yordamchi hujjat. Daromadning asosiy dalili — soliq deklaratsiyasi; bank uni soliq tizimidan o'zi tekshiradi.",
    manba: "https://depozit.uz/news/yakka-tartibdagi-tadbirkor-jismoniy-shaxs-sifatida-kredit-olishi-mumkinmi",
  },
};

/** Shu hujjatning qoralamasini tuzishga ma'lumot yetarlimi. */
export function qoralamaBormi(kalit: string, p: Profil): kalit is QoralamaKalit {
  switch (kalit) {
    case "ariza":
      return p.kredit_summa != null && p.kredit_muddat_oy != null;
    case "tasischi_qarori":
      return p.shakl === "mchj" && p.kredit_summa != null && p.kredit_muddat_oy != null;
    case "daromad_manbalari":
      return p.oylik_tushum != null && p.oylik_xarajat != null;
    case "pul_oqimi":
      return p.oylik_tushum != null && p.oylik_xarajat != null && p.kredit_summa != null && p.kredit_muddat_oy != null;
    default:
      return false;
  }
}

/** Tanlangan bank taklifi (mahsulotlar.ts hisoblagan). Yo'q bo'lsa — umumiy o'rtacha stavka. */
export interface Taklif {
  foiz_min: number;
  foiz_max: number;
  oylik_tolov: number;
}

export interface QoralamaKirish {
  profil: Profil;
  bank: string;
  mahsulot: string;
  taklif?: Taklif | null;
  /** Pasportdan AI o'qigan ism (bo'lsa) */
  ism?: string | null;
}

export interface QoralamaSahifa {
  sarlavha: string;
  izoh: string;
  qatorlar: [string, string][];
  /** Pastdagi imzo joylari */
  imzo: string[];
  /** Bankda haqiqatda qanday o'tadi (QORALAMA_ASOSI) */
  asos: string;
}

const BOSH = "____________________";
const SHAKL: Record<string, string> = {
  yatt: "Yakka tartibdagi tadbirkor (YaTT)",
  mchj: "Mas'uliyati cheklangan jamiyat (MChJ)",
  ozini_band: "O'zini o'zi band qilgan",
  norasmiy: "Ro'yxatdan o'tmagan",
};
const IZOH = "Tadbirkor Yetak suhbatida aytgan ma'lumot asosida. Imzolanmaguncha qoralama.";

/** Oylik to'lov va foiz: bank taklifi bo'lsa — undan, bo'lmasa umumiy stavka bilan. Hisobni kod qiladi. */
export function tolovMatni(k: QoralamaKirish): { tolov: number; foiz: string } {
  const p = k.profil;
  if (k.taklif) {
    const foiz = k.taklif.foiz_min === k.taklif.foiz_max ? `${k.taklif.foiz_max}%` : `${k.taklif.foiz_min}-${k.taklif.foiz_max}%`;
    return { tolov: k.taklif.oylik_tolov, foiz };
  }
  const t = kreditTolovi(p.kredit_summa ?? 0, p.kredit_muddat_oy ?? 1);
  return { tolov: t.oylik_tolov, foiz: `${t.yillik_stavka}% (o'rtacha)` };
}

export function qoralamaSahifa(kalit: Exclude<QoralamaKalit, "pul_oqimi">, k: QoralamaKirish): QoralamaSahifa {
  return { ...sahifaMaydonlari(kalit, k), asos: QORALAMA_ASOSI[kalit].matn };
}

function sahifaMaydonlari(kalit: Exclude<QoralamaKalit, "pul_oqimi">, k: QoralamaKirish): Omit<QoralamaSahifa, "asos"> {
  const p = k.profil;
  const ism = (p.ism ?? k.ism)?.trim() || BOSH;
  const korxona = p.korxona_nomi?.trim() || BOSH;
  const stir = p.stir ?? BOSH;
  if (kalit === "ariza") {
    const t = tolovMatni(k);
    const foyda = p.oylik_tushum != null && p.oylik_xarajat != null ? p.oylik_tushum - p.oylik_xarajat : null;
    const tarix = { yaxshi: "Qarzlar vaqtida to'langan", yomon: "Kechikish bo'lgan", yoq: "Ilgari kredit olmagan" };
    return {
      sarlavha: `Kredit arizasi - ${k.bank}`,
      izoh: `${k.mahsulot}. ${IZOH}`,
      qatorlar: [
        ...(p.shakl === "mchj"
          ? ([["Ariza beruvchi (jamiyat)", korxona], ["Rahbar (F.I.Sh.)", ism]] as [string, string][])
          : ([["Ariza beruvchi (F.I.Sh.)", ism]] as [string, string][])),
        ["STIR", stir],
        ["Tashkiliy shakl", p.shakl ? SHAKL[p.shakl] : BOSH],
        ["Faoliyat turi", p.faoliyat ?? BOSH],
        ["Biznes toifasi", biznesToifasi(p) ?? BOSH],
        ["Faoliyat muddati", p.faoliyat_oy != null ? `${p.faoliyat_oy} oy` : BOSH],
        ["So'ralayotgan summa", p.kredit_summa != null ? somda(p.kredit_summa) : BOSH],
        ["Muddat", p.kredit_muddat_oy != null ? `${p.kredit_muddat_oy} oy` : BOSH],
        ["Kredit maqsadi", p.maqsad ?? BOSH],
        ["Yillik foiz (bank e'lon qilgan)", t.foiz],
        ["Taxminiy oylik to'lov", somda(t.tolov)],
        ["O'rtacha oylik tushum", p.oylik_tushum != null ? somda(p.oylik_tushum) : BOSH],
        ["O'rtacha oylik xarajat", p.oylik_xarajat != null ? somda(p.oylik_xarajat) : BOSH],
        ["Oylik foyda", foyda != null ? somda(foyda) : BOSH],
        ["Ta'minot (garov) taklifi", p.garov_qiymati ? `Mol-mulk, taxminiy qiymati ${somda(p.garov_qiymati)}` : "Garov yo'q"],
        ["Kredit tarixi (o'zi aytgan)", p.kredit_tarixi ? tarix[p.kredit_tarixi] : BOSH],
      ],
      imzo: ["Ariza beruvchi imzosi", "Sana"],
    };
  }
  if (kalit === "tasischi_qarori" && p.ishtirokchilar === "yagona") {
    return {
      sarlavha: "Yagona ishtirokchi qarori",
      izoh: `Jamiyatning yagona ishtirokchisi umumiy yig'ilish o'rniga yozma qaror qabul qiladi. ${IZOH}`,
      qatorlar: [
        ["Jamiyat nomi", korxona],
        ["Yagona ishtirokchi (F.I.Sh.)", ism],
        ["Qaror", `Jamiyat ${k.bank} dan ${p.kredit_summa != null ? somda(p.kredit_summa) : BOSH} miqdorida, ${p.kredit_muddat_oy ?? BOSH} oy muddatga kredit olishga rozilik beraman.`],
        ["Kredit maqsadi", p.maqsad ?? BOSH],
        ["Ta'minot", p.garov_qiymati ? `Jamiyat mol-mulki garovga qo'yiladi (taxminiy qiymati ${somda(p.garov_qiymati)}).` : "Garovsiz yoki bank talab qilgan ta'minot bilan."],
        ["Vakolat", "Jamiyat direktoriga kredit va ta'minot shartnomalarini imzolash vakolati beriladi."],
      ],
      imzo: ["Yagona ishtirokchi imzosi", "Sana", "Muhr"],
    };
  }
  if (kalit === "tasischi_qarori") {
    return {
      sarlavha: "Ishtirokchilar umumiy yig'ilishi bayonnomasi",
      izoh: `Kredit olish va ta'minot berishga rozilik. Tarkib MChJ qonuni (O'RQ-1137) bayonnoma talablariga ko'ra. ${IZOH}`,
      qatorlar: [
        ["Jamiyat nomi", korxona],
        ["Yig'ilish vaqti va joyi", BOSH],
        ["Ishtirok etgan ishtirokchilar va ularning ovozlari (ulushi)", BOSH],
        ["Yig'ilish raisi", BOSH],
        ["Kotib", BOSH],
        ["Kun tartibi", `${k.bank} dan kredit olish va ta'minot berish to'g'risida`],
        ["Ovoz berish natijasi", "Yoqlab: ____  Qarshi: ____  Betaraf: ____"],
        ["Qaror", `Jamiyat ${k.bank} dan ${p.kredit_summa != null ? somda(p.kredit_summa) : BOSH} miqdorida, ${p.kredit_muddat_oy ?? BOSH} oy muddatga kredit olishga rozilik beradi.`],
        ["Kredit maqsadi", p.maqsad ?? BOSH],
        ["Ta'minot", p.garov_qiymati ? `Jamiyat mol-mulki garovga qo'yiladi (taxminiy qiymati ${somda(p.garov_qiymati)}).` : "Garovsiz yoki bank talab qilgan ta'minot bilan."],
        ["Vakolat", "Jamiyat direktoriga kredit va ta'minot shartnomalarini imzolash vakolati beriladi."],
      ],
      imzo: ["Yig'ilish raisi", "Kotib", "Ishtirokchilar imzolari", "Muhr"],
    };
  }
  const foyda = (p.oylik_tushum ?? 0) - (p.oylik_xarajat ?? 0);
  return {
    sarlavha: "Daromad manbalari to'g'risida ma'lumot",
    izoh: `Yakka tartibdagi tadbirkor. ${IZOH}`,
    qatorlar: [
      ["Tadbirkor (F.I.Sh.)", ism],
      ["STIR", stir],
      ["Asosiy daromad manbai", p.faoliyat ?? BOSH],
      ["O'rtacha oylik tushum", p.oylik_tushum != null ? somda(p.oylik_tushum) : BOSH],
      ["O'rtacha oylik xarajat", p.oylik_xarajat != null ? somda(p.oylik_xarajat) : BOSH],
      ["O'rtacha oylik foyda", somda(foyda)],
      ["Boshqa daromad manbalari", BOSH],
    ],
    imzo: ["Tadbirkor imzosi", "Sana"],
  };
}

/**
 * Qoralamalarni to'liq qilish uchun tadbirkordan so'raladigan maydonlar (bank tanlangach, bitta savolda).
 * Faqat papkada shu qoralama bo'lsa so'raladi. STIR ixtiyoriy — bilmasa bo'sh qoladi.
 */
export function qoralamaUchunKerak(p: Profil, qoralamalar: string[]): (keyof Profil)[] {
  const kerak: (keyof Profil)[] = [];
  if (!qoralamalar.some((k) => k === "ariza" || k === "tasischi_qarori" || k === "daromad_manbalari")) return kerak;
  if (!p.ism) kerak.push("ism");
  if (p.shakl === "mchj" && !p.korxona_nomi) kerak.push("korxona_nomi");
  if (qoralamalar.includes("tasischi_qarori") && !p.ishtirokchilar) kerak.push("ishtirokchilar");
  return kerak;
}
