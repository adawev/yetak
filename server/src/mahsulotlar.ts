// Tekshirilgan bank mahsulotlari va ularning tadbirkor profiliga mosligi.
// Manba: docs/tadqiqot/banklar_tekshirilgan.md (2026-11-18). Har shart — bank sahifasi yoki rasmiy hujjatdan.
// Ma'lumot yo'q bo'lsa shart «nomalum» bo'ladi — taxmin qilinmaydi.

import type { MahsulotMoslik, Profil, ShartHolati } from "../../shared/types";
import { mahsulotHujjatNomlari, mahsulotBankTekshiradi } from "./hujjatlar";
import { oylikTolov, somda } from "./rules";

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
  manba: { nom: string; url: string };
  /** Chegaralar — faqat manbadan (hujjatlar.json). null — manbada yo'q. */
  summa_max: number | null;
  muddat_max: number | null;
  foiz: [number, number] | null;
  shartlar: (p: Profil) => Shart[];
}

export const MAHSULOTLAR: Mahsulot[] = [
  {
    kalit: "hamkorbank_pq312",
    bank: "Hamkorbank",
    nom: "«Kichik biznesga ko'mak» (PQ–312)",
    qisqa: "300 mln gacha · 100 mln garovsiz · 18–24% · 84 oygacha",
    manba: {
      nom: "Hamkorbank kredit pasporti",
      url: "https://hamkorbank.uz/uz/assets/docs/business/credits/Kichik_biznesga_komak_kredit_pasporti_uz.pdf",
    },
    summa_max: mln(300),
    muddat_max: 84,
    foiz: [18, 24],
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
          ? nomalum("Kichik tadbirkorlik subyekti (o'zini o'zi band qilganga — bank ko'rib chiqishda aniqlaydi)")
          : tekshir("Kichik tadbirkorlik subyekti (YaTT yoki MChJ)", p.shakl, () => p.shakl === "yatt" || p.shakl === "mchj"),
        tekshir("Ro'yxatdan o'tganiga kamida 1 yil", p.faoliyat_oy, () => p.faoliyat_oy! >= 12),
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
    kalit: "ipakyoli_onlayn",
    bank: "Ipak Yo'li Banki",
    nom: "Tadbirkorlar uchun onlayn kredit",
    qisqa: "200 mln gacha · garovsiz · 30% · 12 oygacha · onlayn",
    manba: { nom: "Ipak Yo'li Banki sahifasi", url: "https://en.ipakyulibank.uz/legal/credit/online-loan-for-business" },
    summa_max: mln(200),
    muddat_max: 12,
    foiz: [30, 30],
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
    manba: { nom: "TBC Bank sahifasi", url: "https://tbcbank.uz/uz/business/product/credit/" },
    summa_max: mln(600),
    muddat_max: 36,
    foiz: [33, 38],
    shartlar: (p) => [
      tekshir("Summa 10–600 mln", p.kredit_summa, () => p.kredit_summa! >= mln(10) && p.kredit_summa! <= mln(600)),
      tekshir(
        "Muddat 3–36 oy",
        p.kredit_muddat_oy,
        () => p.kredit_muddat_oy! >= 3 && p.kredit_muddat_oy! <= 36,
      ),
      tekshir("YaTT yoki MChJ", p.shakl, () => p.shakl === "yatt" || p.shakl === "mchj"),
      tekshir("Kamida 6 oy faoliyat", p.faoliyat_oy, () => p.faoliyat_oy! >= 6),
      p.kredit_tarixi === "yoq"
        ? nomalum("Bank «ijobiy kredit tarixi» so'raydi — kredit olmaganlarni ko'rib chiqishda baholaydi")
        : tekshir("Ijobiy kredit tarixi, muddati o'tgan qarz yo'q", p.kredit_tarixi, () => p.kredit_tarixi === "yaxshi"),
      { matn: "Garov va kafil kerak emas", holat: "ha" },
      nomalum("TBC Business'da hisob raqami (onlayn ochiladi)"),
    ],
  },
  {
    kalit: "mikrokreditbank_birinchi_qadam",
    bank: "Mikrokreditbank",
    nom: "«Biznesga birinchi qadam»",
    qisqa: "50 mln gacha · 21% · 24–84 oy · 125% garov yoki kafil",
    manba: {
      nom: "Mikrokreditbank sahifasi",
      url: "https://mkbank.uz/uz/private/crediting/biznesga-birinchi-qadam-mikroqarz/",
    },
    summa_max: mln(50),
    muddat_max: 84,
    foiz: [21, 21],
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
  {
    kalit: "hamkorbank_biznesga_qadam",
    bank: "Hamkorbank",
    nom: "«Biznesga qadam»",
    qisqa: "100 mln gacha · 25–28% · 36 oygacha · yangi o'zini o'zi band qilganlarga",
    manba: {
      nom: "Hamkorbank kredit pasporti",
      url: "https://hamkorbank.uz/uz/assets/docs/business/credits/Biznesga_qadam_kredit_pasporti_uz.pdf",
    },
    summa_max: mln(100),
    muddat_max: 36,
    foiz: [25, 28],
    shartlar: (p) => [
      tekshir("Faqat o'zini o'zi band qilganlar", p.shakl, () => p.shakl === "ozini_band"),
      tekshir("Ro'yxatdan o'tganiga 6 oydan oshmagan", p.faoliyat_oy, () => p.faoliyat_oy! <= 6),
      tekshir("Kredit tarixi salbiy emas", p.kredit_tarixi, () => p.kredit_tarixi !== "yomon"),
      tekshir("Summa 100 mln gacha", p.kredit_summa, () => p.kredit_summa! <= mln(100)),
      tekshir("Muddat 36 oygacha", p.kredit_muddat_oy, () => p.kredit_muddat_oy! <= 36),
      p.kredit_summa != null && p.kredit_summa <= mln(10)
        ? nomalum("Ta'minot: sug'urta polisi yoki rasmiy daromadli kafil")
        : nomalum("Ta'minot: depozit, ko'chmas mulk, avtomobil yoki tilla"),
      nomalum("Yosh 21–60"),
    ],
  },
  {
    kalit: "sqb_tezkor_plus",
    bank: "SQB",
    nom: "«Tezkor+»",
    qisqa: "25% · 36 oygacha · 3 oy imtiyoz · garov 135%",
    manba: { nom: "SQB sahifasi", url: "https://sqb.uz/uz/business/small-business-credits/tezkor-krediti" },
    summa_max: null,
    muddat_max: 36,
    foiz: [25, 25],
    shartlar: (p) => {
      const s = p.kredit_summa;
      return [
        tekshir("YaTT yoki MChJ", p.shakl, () => p.shakl === "yatt" || p.shakl === "mchj"),
        tekshir("Kamida 6 oy faoliyat (summa katta bo'lsa — ko'proq)", p.faoliyat_oy, () => p.faoliyat_oy! >= 6),
        p.shakl === "yatt"
          ? tekshir("YaTT uchun summa 1 mlrd gacha", s, () => s! <= mln(1000))
          : nomalum("Summa chegarasi dollarda — bank kurs bo'yicha hisoblaydi"),
        tekshir("Muddat 36 oygacha", p.kredit_muddat_oy, () => p.kredit_muddat_oy! <= 36),
        tekshir(
          "Garov summaning 135% idan kam emas",
          s == null || p.garov_qiymati == null ? null : 1,
          () => p.garov_qiymati! >= s! * 1.35,
        ),
        tekshir("Kredit tarixi salbiy emas", p.kredit_tarixi, () => p.kredit_tarixi !== "yomon"),
        nomalum("Oxirgi 6 oyda har oy tushum bo'lgan"),
      ];
    },
  },
  {
    kalit: "kapitalbank_standart",
    bank: "Kapitalbank",
    nom: "Standart biznes krediti",
    qisqa: "Garov 125% · 6 oydan ishlaganlarga · shartlar reklama materialidan",
    manba: { nom: "Spot.uz — Kapitalbank (reklama materiali)", url: "https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/" },
    summa_max: null,
    muddat_max: null,
    foiz: null,
    shartlar: (p) => {
      const s = p.kredit_summa;
      return [
        tekshir("YaTT yoki MChJ", p.shakl, () => p.shakl === "yatt" || p.shakl === "mchj"),
        tekshir("Kamida 6 oy faoliyat", p.faoliyat_oy, () => p.faoliyat_oy! >= 6),
        tekshir(
          "Zarar bilan ishlamaydi",
          p.oylik_tushum == null || p.oylik_xarajat == null ? null : 1,
          () => p.oylik_tushum! > p.oylik_xarajat!,
        ),
        tekshir("Kredit tarixi salbiy emas", p.kredit_tarixi, () => p.kredit_tarixi !== "yomon"),
        tekshir(
          "Garov summaning 125% idan kam emas",
          s == null || p.garov_qiymati == null ? null : 1,
          () => p.garov_qiymati! >= s! * 1.25,
        ),
        nomalum("Kapitalbankda hisob raqam (ochsa bo'ladi)"),
      ];
    },
  },
];

const TARTIB ={ mos: 0, qisman: 1, mos_emas: 2 } as const;

/** Profilni har bir mahsulot bilan solishtiradi. Shakl va summa noma'lum bo'lsa — bo'sh ro'yxat. */
export function mahsulotlarniMoslash(p: Profil): MahsulotMoslik[] {
  if (p.shakl == null || p.kredit_summa == null) return [];
  // Har bankka umumiy: zarar bilan ishlasa kreditni qaytarib bo'lmaydi (hisob — kod).
  const foyda = p.oylik_tushum != null && p.oylik_xarajat != null ? p.oylik_tushum - p.oylik_xarajat : null;
  return MAHSULOTLAR.map((m) => {
    const shartlar = m.shartlar(p);
    if (foyda != null && foyda <= 0) shartlar.push({ matn: "Oylik foyda bor (zarar bilan ishlamaydi)", holat: "yoq" });
    const yoq = shartlar.filter((s) => s.holat === "yoq").length;
    const mos: MahsulotMoslik["mos"] = yoq > 0 ? "mos_emas" : shartlar.some((s) => s.holat === "nomalum") ? "qisman" : "mos";
    let taklif: MahsulotMoslik["taklif"] = null;
    if (mos !== "mos_emas" && m.foiz && p.kredit_muddat_oy != null) {
      const summa = Math.min(p.kredit_summa!, m.summa_max ?? p.kredit_summa!);
      const muddat_oy = Math.min(p.kredit_muddat_oy, m.muddat_max ?? p.kredit_muddat_oy);
      taklif = {
        summa,
        foiz_min: m.foiz[0],
        foiz_max: m.foiz[1],
        muddat_oy,
        oylik_tolov: Math.round(oylikTolov(summa, m.foiz[1], muddat_oy)),
        foyda_ulushi: foyda != null && foyda > 0 ? Math.round((oylikTolov(summa, m.foiz[1], muddat_oy) / foyda) * 100) : null,
        izoh:
          m.kalit === "hamkorbank_pq312" && summa > mln(100)
            ? "18–24% faqat 100 mln gacha qismiga; qolgani bankning odatiy foizida — to'lov biroz ko'proq bo'lishi mumkin."
            : null,
      };
    }
    return {
      kalit: m.kalit,
      bank: m.bank,
      nom: m.nom,
      qisqa: m.qisqa,
      shartlar,
      mos,
      taklif,
      hujjatlar: mahsulotHujjatNomlari(m.kalit, p),
      bank_tekshiradi: mahsulotBankTekshiradi(m.kalit),
      manba: m.manba,
    };
  }).sort((a, b) => {
    const t = TARTIB[a.mos] - TARTIB[b.mos];
    if (t !== 0) return t;
    const yoqSoni = (x: MahsulotMoslik) => x.shartlar.filter((s) => s.holat === "yoq").length;
    const y = yoqSoni(a) - yoqSoni(b);
    if (y !== 0) return y;
    // Kamroq «?» — aniqroq mos mahsulot.
    const nSoni = (x: MahsulotMoslik) => x.shartlar.filter((s) => s.holat === "nomalum").length;
    const n = nSoni(a) - nSoni(b);
    if (n !== 0) return n;
    // Tadbirkorga arzoni oldin: yuqori foiz kamroq bo'lgan mahsulot.
    const f = (a.taklif?.foiz_max ?? 100) - (b.taklif?.foiz_max ?? 100);
    if (f !== 0) return f;
    // Ko'proq tasdiqlangan («ha») shart — aniqroq mos mahsulot.
    const haSoni = (x: MahsulotMoslik) => x.shartlar.filter((s) => s.holat === "ha").length;
    return haSoni(b) - haSoni(a);
  });
}
