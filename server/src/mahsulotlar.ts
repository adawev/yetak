// Tekshirilgan bank mahsulotlari va ularning tadbirkor profiliga mosligi.
// Manba: docs/tadqiqot/banklar_tekshirilgan.md (2026-11-18). Har shart — bank sahifasi yoki rasmiy hujjatdan.
// Ma'lumot yo'q bo'lsa shart «nomalum» bo'ladi — taxmin qilinmaydi.

import type { MahsulotMoslik, Profil, ShartHolati } from "../../shared/types";
import { somda } from "./rules";

type Shart = { matn: string; holat: ShartHolati };

const mln = (n: number) => n * 1_000_000;
const nomalum = (matn: string): Shart => ({ matn, holat: "nomalum" });
const tekshir = (matn: string, qiymat: unknown, shart: () => boolean): Shart =>
  qiymat == null ? nomalum(matn) : { matn, holat: shart() ? "ha" : "yoq" };

interface Mahsulot {
  kalit: string;
  bank: string;
  nom: string;
  qisqa: string;
  hujjatlar: string[];
  bank_tekshiradi: string[];
  manba: { nom: string; url: string };
  shartlar: (p: Profil) => Shart[];
}

export const MAHSULOTLAR: Mahsulot[] = [
  {
    kalit: "hamkor_pq312",
    bank: "Hamkorbank",
    nom: "«Kichik biznesga ko'mak» (PQ–312)",
    qisqa: "300 mln gacha · 100 mln garovsiz · 18–24% · 84 oygacha",
    hujjatlar: [
      "Kredit buyurtmanomasi",
      "Pul oqimi prognozi",
      "Tovar yoki uskuna oldi-sotdi shartnomasi",
      "Faoliyat joyi hujjati (yoki kassa cheklari)",
      "MChJ bo'lsa — ta'sischilar roziligi",
      "100 mln dan ortiq qismi uchun garov hujjatlari",
    ],
    bank_tekshiradi: [
      "Kichik biznes maqomi — soliq kabineti yoki integratsiya orqali",
      "Faoliyat muddati — guvohnoma yoki integratsiya orqali",
      "Kredit tarixi — kredit byurosidan",
    ],
    manba: {
      nom: "Hamkorbank kredit pasporti",
      url: "https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf",
    },
    shartlar: (p) => {
      const s = p.kredit_summa;
      const garov: Shart =
        s == null
          ? nomalum("100 mln dan ortiq qismi uchun garov")
          : s <= mln(100)
            ? { matn: "Summa 100 mln gacha — garov kerak emas", holat: "ha" }
            : p.garov_qiymati == null
              ? nomalum(`${somda(s - mln(100))} uchun garov kerak`)
              : p.garov_qiymati > 0
                ? nomalum(`${somda(s - mln(100))} uchun garov kerak — garovingizni bank baholaydi`)
                : { matn: `${somda(s - mln(100))} uchun garov kerak — garov yo'q`, holat: "yoq" };
      return [
        p.shakl === "ozini_band"
          ? nomalum("Kichik tadbirkorlik subyekti (o'zini o'zi band qilgan mos kelishini bankdan so'rang)")
          : tekshir("Kichik tadbirkorlik subyekti (YaTT yoki MChJ)", p.shakl, () => p.shakl === "yatt" || p.shakl === "mchj"),
        tekshir("Kamida 1 yil faoliyat", p.faoliyat_oy, () => p.faoliyat_oy! >= 12),
        tekshir("Kredit tarixi ijobiy yoki umuman yo'q", p.kredit_tarixi, () => p.kredit_tarixi !== "yomon"),
        tekshir("Summa 300 mln gacha", s, () => s! <= mln(300)),
        garov,
        p.kredit_muddat_oy != null && p.kredit_muddat_oy > 36 && p.kredit_muddat_oy <= 84
          ? nomalum("36 oydan uzun muddat faqat asosiy vosita uchun (84 oygacha)")
          : tekshir("Muddat 84 oygacha", p.kredit_muddat_oy, () => p.kredit_muddat_oy! <= 84),
      ];
    },
  },
  {
    kalit: "ipak_onlayn",
    bank: "Ipak Yo'li Banki",
    nom: "Tadbirkorlar uchun onlayn kredit",
    qisqa: "200 mln gacha · garovsiz · 30% · 12 oygacha · onlayn",
    hujjatlar: ["Ipak Yo'li Bankida hisob raqami", "Ipak Yuli Business ilovasida onlayn ariza"],
    bank_tekshiradi: ["Hisob raqamdagi aylanma — avtomatik, qaror bir necha daqiqada"],
    manba: { nom: "Ipak Yo'li Banki sahifasi", url: "https://en.ipakyulibank.uz/legal/credit/online-loan-for-business" },
    shartlar: (p) => [
      tekshir("Faqat YaTT", p.shakl, () => p.shakl === "yatt"),
      tekshir("Oxirgi 12 oyda aylanma (kamida 1 yil faoliyat)", p.faoliyat_oy, () => p.faoliyat_oy! >= 12),
      tekshir("Summa 200 mln gacha", p.kredit_summa, () => p.kredit_summa! <= mln(200)),
      tekshir("Muddat 12 oygacha", p.kredit_muddat_oy, () => p.kredit_muddat_oy! <= 12),
      { matn: "Garov kerak emas", holat: "ha" },
      nomalum("Ipak Yo'li Bankida hisob raqami (ochsa bo'ladi)"),
    ],
  },
  {
    kalit: "tbc_onlayn",
    bank: "TBC Bank",
    nom: "TBC Business onlayn kredit",
    qisqa: "10–600 mln · garovsiz · 33–38% · 3–36 oy · onlayn",
    hujjatlar: ["TBC Business ilovasida hisob va onlayn ariza"],
    bank_tekshiradi: [],
    manba: { nom: "Spot.uz — TBC (reklama materiali)", url: "https://www.spot.uz/ru/2026/05/01/tbc/" },
    shartlar: (p) => [
      tekshir("Summa 10–600 mln", p.kredit_summa, () => p.kredit_summa! >= mln(10) && p.kredit_summa! <= mln(600)),
      tekshir(
        "Muddat 3–36 oy",
        p.kredit_muddat_oy,
        () => p.kredit_muddat_oy! >= 3 && p.kredit_muddat_oy! <= 36,
      ),
      { matn: "Garov kerak emas", holat: "ha" },
      nomalum("Faoliyat muddati va kimlarga berilishi — bankdan aniqlang"),
    ],
  },
  {
    kalit: "mkb_birinchi_qadam",
    bank: "Mikrokreditbank",
    nom: "«Biznesga birinchi qadam»",
    qisqa: "50 mln gacha · 21% · 24–84 oy · 125% garov yoki kafil",
    hujjatlar: ["ID-karta yoki pasport", "O'zini o'zi band qilganlik guvohnomasi", "Garov yoki kafillik hujjatlari"],
    bank_tekshiradi: [],
    manba: {
      nom: "Mikrokreditbank sahifasi",
      url: "https://mkbank.uz/uz/private/crediting/biznesga-birinchi-qadam-mikroqarz/",
    },
    shartlar: (p) => {
      const s = p.kredit_summa;
      const garovYetadi = s != null && p.garov_qiymati != null && p.garov_qiymati >= s * 1.25;
      return [
        tekshir("Faqat o'zini o'zi band qilganlar", p.shakl, () => p.shakl === "ozini_band"),
        tekshir("Summa 50 mln gacha", s, () => s! <= mln(50)),
        tekshir(
          "Muddat 24–84 oy",
          p.kredit_muddat_oy,
          () => p.kredit_muddat_oy! >= 24 && p.kredit_muddat_oy! <= 84,
        ),
        garovYetadi
          ? { matn: "Garov summaning 125% idan kam emas", holat: "ha" }
          : nomalum("Garov 125% yoki kafil kerak"),
        nomalum("Yosh 18–55"),
      ];
    },
  },
];

const TARTIB = { mos: 0, qisman: 1, mos_emas: 2 } as const;

/** Profilni har bir mahsulot bilan solishtiradi. Shakl va summa noma'lum bo'lsa — bo'sh ro'yxat. */
export function mahsulotlarniMoslash(p: Profil): MahsulotMoslik[] {
  if (p.shakl == null || p.kredit_summa == null) return [];
  return MAHSULOTLAR.map((m) => {
    const shartlar = m.shartlar(p);
    const yoq = shartlar.filter((s) => s.holat === "yoq").length;
    const mos: MahsulotMoslik["mos"] = yoq > 0 ? "mos_emas" : shartlar.some((s) => s.holat === "nomalum") ? "qisman" : "mos";
    return {
      kalit: m.kalit,
      bank: m.bank,
      nom: m.nom,
      qisqa: m.qisqa,
      shartlar,
      mos,
      hujjatlar: m.hujjatlar,
      bank_tekshiradi: m.bank_tekshiradi,
      manba: m.manba,
    };
  }).sort((a, b) => {
    const t = TARTIB[a.mos] - TARTIB[b.mos];
    if (t !== 0) return t;
    const yoqSoni = (x: MahsulotMoslik) => x.shartlar.filter((s) => s.holat === "yoq").length;
    return yoqSoni(a) - yoqSoni(b);
  });
}
