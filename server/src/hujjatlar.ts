// Hujjatlar papkasi: tanlangan bank mahsuloti uchun qaysi hujjat kerak va uni qanday olish.
// Yagona manba: docs/tadqiqot/hujjatlar.json (tadqiqotchi jadvali + «olish» yo'llari, manbali).
// Hujjat ro'yxatini faqat shu fayl beradi — mahsulot kartasi ham, papka ham, PDF ham shu yerdan oladi.

import manbaJson from "../../docs/tadqiqot/hujjatlar.json";
import { yuridikShaxs, type MahsulotMoslik, type OlishYoli, type Papka, type PapkaHujjat, type Profil, type YuklanganFayl } from "../../shared/types";
import { matnTozala } from "./papka-pdf";
import { QORALAMA_ASOSI, QORALAMA_MATNI, qoralamaBormi } from "./qoralamalar";

interface JsonHujjat {
  nom: string;
  qayerdan?: string;
  olish?: OlishYoli;
}
interface JsonMahsulot {
  id: string;
  bank: string;
  nom: string;
  /** olish — shu bankda boshqacha bo'lsa (masalan, ariza faqat bank ilovasida). */
  hujjatlar: { hujjat: string; shart?: string; olish?: OlishYoli }[];
  bank_ozi_tekshiradi?: string[];
}

const MANBA = manbaJson as unknown as { hujjatlar: Record<string, JsonHujjat>; mahsulotlar: JsonMahsulot[] };
const MLN = 1_000_000;

const jsonMahsulot = (kalit: string) => MANBA.mahsulotlar.find((m) => m.id === kalit);

/** Ariza berishdan oldin har kim o'zi tekshirib oladigan hujjat (bank ham tekshiradi). */
const TAVSIYA = ["kredit_tarixi"] as const;

/** Pul oqimi qoralamasi uchun kerakli raqamlar to'liqmi. */
export const pulOqimiQoralamaBor = (p: Profil): boolean => qoralamaBormi("pul_oqimi", p);

/** Hujjat tayyormi: tekshiruvdan o'tgan fayl yoki (fayl yuklanmagan bo'lsa) Yetak tayyorlagan qoralama. */
export const hujjatTayyormi = (h: PapkaHujjat): boolean =>
  h.fayl ? h.fayl.tekshiruv?.holat === "mos" : !!h.qoralama;

/**
 * Hujjat shartini profilga qarab o'qiydi.
 * kerak=false — bu tadbirkorga tegishli emas (masalan, YaTT uchun MChJ hujjati).
 * matn — tadbirkorga ko'rsatiladigan shart ("MChJ bo'lsa"), null — har doim kerak.
 */
export function shartniOqish(shart: string | undefined, p: Profil): { kerak: boolean; matn: string | null } {
  if (!shart) return { kerak: true, matn: null };
  switch (shart) {
    case "yuridik_shaxs":
      return { kerak: p.shakl == null || yuridikShaxs(p.shakl), matn: yuridikShaxs(p.shakl) ? null : "Korxona bo'lsa" };
    case "yatt":
      return { kerak: p.shakl == null || p.shakl === "yatt", matn: p.shakl === "yatt" ? null : "YaTT bo'lsa" };
    case "garov bo'lsa":
    case "mulk garovga qo'yilsa":
      return { kerak: p.garov_qiymati == null || p.garov_qiymati > 0, matn: "Garov qo'ysangiz" };
    case "100 mln dan oshgan qismi":
      return {
        kerak: p.kredit_summa == null || p.kredit_summa > 100 * MLN,
        matn: "100 mln dan oshgan qismi uchun",
      };
    case "xususiy korxonaga shart emas":
      return { kerak: p.shakl == null || (yuridikShaxs(p.shakl) && p.shakl !== "xususiy"), matn: "Xususiy korxonaga shart emas" };
    case "faoliyat talab qilsa":
      return { kerak: true, matn: "Faoliyatingiz litsenziya talab qilsa" };
    case "kafillik berilsa":
      return { kerak: true, matn: "Kafil bilan olsangiz" };
    case "ilovada":
      return { kerak: true, matn: "Bank ilovasida to'ldiriladi" };
    case "pul naqdsiz o'tkazilsa":
      return { kerak: true, matn: "Pul sotuvchiga naqdsiz o'tkazilsa" };
    case "yoki kassa/terminal cheklari":
      return { kerak: true, matn: "Yoki kassa / terminal cheklari" };
    default:
      return { kerak: true, matn: shart };
  }
}

/** Mahsulot kartasi uchun: tadbirkor olib boradigan hujjatlar nomi. */
export function mahsulotHujjatNomlari(kalit: string, p: Profil): string[] {
  const m = jsonMahsulot(kalit);
  if (!m) return [];
  return m.hujjatlar.flatMap((h) => {
    const s = shartniOqish(h.shart, p);
    const nom = MANBA.hujjatlar[h.hujjat]?.nom ?? h.hujjat;
    return s.kerak ? [s.matn ? `${nom} (${s.matn.toLowerCase()})` : nom] : [];
  });
}

/** Bank o'zi tizimdan oladigan narsalar: kalit hujjat bo'lsa uning nomi, bo'lmasa manbadagi matn. */
export function mahsulotBankTekshiradi(kalit: string): string[] {
  return (jsonMahsulot(kalit)?.bank_ozi_tekshiradi ?? []).map((x) => MANBA.hujjatlar[x]?.nom ?? x);
}

/** Yuklashga ruxsat etilgan hujjat kalitimi (shu mahsulot papkasida bormi). */
export function papkadaBormi(papka: Papka | null, kalit: string): boolean {
  return !!papka?.hujjatlar.some((h) => h.kalit === kalit && !h.bank_ozi_oladi);
}

const ismNorm = (s: string) =>
  matnTozala(s)
    .toLowerCase()
    .replace(/'/g, "")
    .split(/[^a-z]+/)
    .filter((w) => w.length > 2);

/** Hujjatlardagi ismlar bir-biriga mos kelmasa — ogohlantirish. Hisobni kod qiladi, AI faqat ismni o'qiydi. */
export function ismlarniSolishtirish(hujjatlar: PapkaHujjat[]): string[] {
  const ismlar = hujjatlar
    .filter((h) => h.fayl?.tekshiruv?.egasi)
    .map((h) => ({ nom: h.nom, egasi: h.fayl!.tekshiruv!.egasi!, sozlar: ismNorm(h.fayl!.tekshiruv!.egasi!) }))
    .filter((x) => x.sozlar.length > 0);
  const natija: string[] = [];
  for (let i = 1; i < ismlar.length; i++) {
    const a = ismlar[0];
    const b = ismlar[i];
    if (!b.sozlar.some((w) => a.sozlar.includes(w))) {
      natija.push(`«${a.nom}» va «${b.nom}» dagi ism farq qiladi: ${a.egasi} / ${b.egasi}. Bank buni albatta so'raydi.`);
    }
  }
  return natija;
}

/**
 * Papkani yig'adi. `tanlov` — tadbirkor tanlagan mahsulot; yo'q yoki noto'g'ri bo'lsa — eng mos mahsulot.
 * Mahsulotlar hali yo'q bo'lsa (shakl yoki summa noma'lum) — null.
 */
export function papkaYasash(
  p: Profil,
  mahsulotlar: MahsulotMoslik[],
  tanlov: string | undefined,
  fayllar: Record<string, YuklanganFayl>,
): Papka | null {
  const tanlangan = mahsulotlar.find((m) => m.kalit === tanlov) ?? mahsulotlar[0];
  const m = tanlangan && jsonMahsulot(tanlangan.kalit);
  if (!tanlangan || !m) return null;

  const hujjatlar: PapkaHujjat[] = [];
  const bor = new Set<string>();
  for (const h of m.hujjatlar) {
    const s = shartniOqish(h.shart, p);
    if (!s.kerak || bor.has(h.hujjat)) continue;
    bor.add(h.hujjat);
    const j = MANBA.hujjatlar[h.hujjat];
    hujjatlar.push({
      kalit: h.hujjat,
      nom: j?.nom ?? h.hujjat,
      shart: s.matn,
      bank_ozi_oladi: false,
      tavsiya: false,
      olish: h.olish ?? j?.olish ?? null,
      fayl: fayllar[h.hujjat] ?? null,
      // Ariza bank ilovasida beriladigan bo'lsa (TBC, Ipak Yo'li) — qoralama emas, ilovadagi qadamlar
      qoralama: h.shart !== "ilovada" && qoralamaBormi(h.hujjat, p) ? QORALAMA_MATNI[h.hujjat] : null,
      qoralama_asos: h.shart !== "ilovada" && qoralamaBormi(h.hujjat, p) ? QORALAMA_ASOSI[h.hujjat] : null,
    });
  }
  for (const k of TAVSIYA) {
    if (bor.has(k)) continue;
    bor.add(k);
    const j = MANBA.hujjatlar[k];
    hujjatlar.push({
      kalit: k,
      nom: j.nom,
      shart: "Bank o'zi ham tekshiradi. Oldindan ko'rib oling: muammo bo'lsa, ariza rad etiladi",
      bank_ozi_oladi: false,
      tavsiya: true,
      olish: j.olish ?? null,
      fayl: fayllar[k] ?? null,
      qoralama: null,
    });
  }
  if (p.eri_bor === false && !bor.has("eri")) {
    bor.add("eri");
    const j = MANBA.hujjatlar.eri;
    hujjatlar.push({
      kalit: "eri",
      nom: j?.nom ?? "Elektron imzo (ERI)",
      shart: "Onlayn ariza va ko'p davlat xizmatlari uchun kerak",
      bank_ozi_oladi: false,
      tavsiya: true,
      olish: j?.olish ?? null,
      fayl: fayllar.eri ?? null,
      qoralama: null,
    });
  }
  for (const x of m.bank_ozi_tekshiradi ?? []) {
    if (bor.has(x)) continue;
    bor.add(x);
    hujjatlar.push({
      kalit: `bank:${x}`,
      nom: MANBA.hujjatlar[x]?.nom ?? x,
      shart: null,
      bank_ozi_oladi: true,
      tavsiya: false,
      olish: null,
      fayl: null,
      qoralama: null,
    });
  }

  const olibBoriladi = hujjatlar.filter((h) => !h.bank_ozi_oladi && !h.tavsiya);
  return {
    mahsulot: { kalit: tanlangan.kalit, bank: tanlangan.bank, nom: tanlangan.nom },
    hujjatlar,
    tayyor: olibBoriladi.filter(hujjatTayyormi).length,
    jami: olibBoriladi.length,
    ogohlantirishlar: ismlarniSolishtirish(hujjatlar),
  };
}
