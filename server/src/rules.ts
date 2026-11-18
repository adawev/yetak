// Yagona qoidalar joyi. Hukm, topilmalar, yo'l xaritasi va barcha hisoblar shu yerda.
// Agent ham, web ham hisoblamaydi — faqat shu fayl.
// Har qoidada manba bor. Manbasi yo'q yoki bizning hisobimiz bo'lsa: taxmin = true.
// Manbalar ro'yxati: docs/QOIDALAR.md. U yerda yangi qator chiqsa — shu yerga kiritiladi.

import {
  PROFIL_MAYDONLARI,
  type MahsulotMoslik,
  type Hisob,
  type Hukm,
  type Manba,
  type Natija,
  type Profil,
  type Qadam,
  type Topilma,
} from "../../shared/types";

export const MANBALAR = {
  kapitalbank: {
    nom: "Spot.uz — Kapitalbank kredit talablari (reklama materiali)",
    url: "https://www.spot.uz/oz/2026/10/07/kapitalbank-kredit/",
  },
  kafolat: {
    nom: "gov.uz — Tadbirkorlikni rivojlantirish kompaniyasi kafolati",
    url: "https://gov.uz/oz/quvasoy/news/view/224414",
  },
  mikrokredit: {
    nom: "Anhor — garovsiz mikrokredit",
    url: "https://anhor.uz/news/microcredit-boost/",
  },
  kompensatsiya: {
    nom: "Spot.uz — foiz kompensatsiyasi",
    url: "https://www.spot.uz/oz/2026/09/12/loans-entrepreneurs/",
  },
  biznesStart: {
    nom: "gov.uz — «Biznes start» dasturi",
    url: "https://gov.uz/oz/bv-jizzax/news/view/207503",
  },
  stavka: {
    nom: "Markaziy bank — yuridik shaxslarga aylanma mablag' uchun o'rtacha stavka (21.09.2026)",
    url: "https://cbu.uz/upload/medialibrary/9ca/bvticcmgifan5k0kcyg11nyajwjta1ov/Foiz_stavkalar_21_09_2026.pdf",
  },
  tadbircore: {
    nom: "UzA — TadbirCore: turli banklar takliflari bir joyda",
    url: "https://uza.uz/ar/posts/tadbircoreuz-turli-banklarning-takliflarini-bir-joyda-jamlagan-platforma_885812",
  },
} satisfies Record<string, Manba>;

/** Raqamli qoidalar. Har biri manbasi bilan (yuqorida). */
export const QOIDA = {
  /** Kamida 6 oy faoliyat — Kapitalbank (matbuot). */
  minFaoliyatOy: 6,
  /** Garov kredit summasining kamida 125 foizi — Kapitalbank (matbuot). */
  garovUlushi: 1.25,
  /** Kafolat: kredit summasining 75 foizigacha — gov.uz. */
  kafolatUlushi: 0.75,
  /** Garovsiz mikrokredit: 200 mln so'mgacha — Anhor (matbuot). */
  mikrokreditMax: 200_000_000,
  /** «Biznes start»: 200 mln so'mgacha garovsiz, yangi boshlovchilar uchun — gov.uz, president.uz; qaysi bank orqali ishlashi topilmadi. */
  biznesStartMax: 200_000_000,
  /** Yuridik shaxslar, aylanma mablag': o'rtacha 23,1% (banklar bo'yicha 20,5–33,1%) — Markaziy bank, 21.09.2026. Har mijozga alohida. */
  yillikStavka: 23.1,
  /** Bizning ehtiyot chegaramiz (bank qoidasi emas): to'lov foydaning yarmidan oshmasin. */
  tolovFoydaUlushiMax: 0.5,
};

/**
 * Hukm uchun kerakli maydonlar (6 ta savolda so'raladi). «avval_mikrokredit» va «eri_bor» so'ralmaydi:
 * tadbirkor o'zi aytsa saqlanadi, aytmasa hukmga ta'sir qilmaydi.
 */
export function kerakliMaydonlar(_p: Profil): (keyof Profil)[] {
  return PROFIL_MAYDONLARI;
}

/** Tadbirkorga beriladigan 6 ta savol — har biri bir yoki bir nechta maydonni to'ldiradi. */
export const SAVOLLAR: (keyof Profil)[][] = [
  ["faoliyat"],
  ["shakl", "faoliyat_oy"],
  ["oylik_tushum", "oylik_xarajat"],
  ["kredit_summa", "kredit_muddat_oy", "maqsad"],
  ["garov_qiymati"],
  ["kredit_tarixi"],
];

/** Jarayon chizig'i uchun: nechta savolga to'liq javob berilgan. */
export function savolJarayoni(p: Profil): { toldirilgan: number; jami: number } {
  const bor = (k: keyof Profil) => p[k] !== undefined && p[k] !== null;
  return { toldirilgan: SAVOLLAR.filter((g) => g.every(bor)).length, jami: SAVOLLAR.length };
}

export function toldirilganSoni(p: Profil): number {
  return kerakliMaydonlar(p).filter((k) => p[k] !== undefined && p[k] !== null).length;
}

export function yetishmayotgan(p: Profil): (keyof Profil)[] {
  return kerakliMaydonlar(p).filter((k) => p[k] === undefined || p[k] === null);
}

export function profilTolami(p: Profil): boolean {
  return yetishmayotgan(p).length === 0;
}

/**
 * Biznes toifasi — yillik daromad bo'yicha (PF-21, 10.02.2023; matbuot: buxgalter.uz, tashkenttimes.uz).
 * Mikrofirma ≤ 1 mlrd, kichik 1–10 mlrd, o'rta 10–100 mlrd, yirik ≥ 100 mlrd so'm. YaTT — kichik biznes.
 * Yillik daromad = oylik tushum × 12 (tadbirkor aytgan o'rtacha) — taxmin.
 */
export function biznesToifasi(p: Profil): string | null {
  if (p.shakl === "yatt") return "Kichik biznes (YaTT)";
  if (p.shakl === "ozini_band") return "O'zini o'zi band qilgan";
  if (p.shakl === "norasmiy") return "Ro'yxatdan o'tmagan";
  if (p.oylik_tushum == null) return null;
  const yillik = p.oylik_tushum * 12;
  const mlrd = 1_000_000_000;
  if (yillik <= mlrd) return "Mikrofirma (yillik daromad 1 mlrd so'mgacha)";
  if (yillik <= 10 * mlrd) return "Kichik korxona (yillik daromad 1–10 mlrd so'm)";
  if (yillik <= 100 * mlrd) return "O'rta biznes (yillik daromad 10–100 mlrd so'm)";
  return "Yirik biznes (yillik daromad 100 mlrd so'mdan ko'p)";
}

/** "12 500 000 so'm" */
export function somda(n: number): string {
  return `${Math.round(n).toLocaleString("en-US").replace(/,/g, " ")} so'm`;
}

/** Oylik annuitet to'lovi. */
export function oylikTolov(summa: number, yillikFoiz: number, oylar: number): number {
  if (summa <= 0 || oylar <= 0) return 0;
  const r = yillikFoiz / 100 / 12;
  if (r === 0) return summa / oylar;
  return (summa * r) / (1 - Math.pow(1 + r, -oylar));
}

/** Shu oylik to'lov bilan olsa bo'ladigan eng katta summa (annuitetning teskarisi). */
/** Oylik to'lov va stavka — hukm ham, papka PDF dagi pul oqimi ham shu yerdan oladi. */
export function kreditTolovi(summa: number, muddatOy: number): { yillik_stavka: number; oylik_tolov: number } {
  const yillik_stavka = QOIDA.yillikStavka;
  return { yillik_stavka, oylik_tolov: Math.round(oylikTolov(summa, yillik_stavka, muddatOy)) };
}

export function tolovgaMosSumma(tolov: number, yillikFoiz: number, oylar: number): number {
  if (tolov <= 0 || oylar <= 0) return 0;
  const r = yillikFoiz / 100 / 12;
  if (r === 0) return tolov * oylar;
  return (tolov * (1 - Math.pow(1 + r, -oylar))) / r;
}

/** Pastga, 1 mln ga yaxlitlaydi — maslahatdagi summa chiroyli ko'rinsin, oshib ketmasin. */
const mlnPastga = (n: number) => Math.max(0, Math.floor(n / 1_000_000) * 1_000_000);

type TolaProfil = Required<Profil>;

/**
 * Asosiy funksiya. Profil to'liq bo'lmasa — null.
 * `bajarilgan` — tadbirkor belgilagan qadamlar kalitlari.
 */
export function baholash(
  profil: Profil,
  bajarilgan: string[] = [],
  /** Aniq bank mahsulotlariga moslik (mahsulotlar.ts). Natija bilan mahsulot kartasi bir-biriga zid bo'lmasin. */
  mahsulotlar: MahsulotMoslik[] = [],
): Natija | null {
  if (!profilTolami(profil)) return null;
  const p = profil as TolaProfil;

  const topilmalar: Topilma[] = [];
  const qadamlar: Omit<Qadam, "bajarildi">[] = [];
  let olmangSababi: string | null = null;

  // --- Hisob (hammasi kodda) ---
  const oylik_foyda = p.oylik_tushum - p.oylik_xarajat;
  // To'lov — eng mos bank taklifidan (kartadagi va PDF dagi bilan bir xil), summa va muddat o'zgarmagan bo'lsa.
  // Taklif yo'q bo'lsa — Markaziy bankning o'rtacha stavkasi.
  const engMos = mahsulotlar.find(
    (m) => m.mos !== "mos_emas" && m.taklif && m.taklif.summa === p.kredit_summa && m.taklif.muddat_oy === p.kredit_muddat_oy,
  )?.taklif;
  const { yillik_stavka, oylik_tolov } = engMos
    ? { yillik_stavka: engMos.foiz_max, oylik_tolov: engMos.oylik_tolov }
    : kreditTolovi(p.kredit_summa, p.kredit_muddat_oy);
  const kerakli_garov = Math.round(p.kredit_summa * QOIDA.garovUlushi);
  const hisob: Hisob = { oylik_foyda, oylik_tolov, yillik_stavka, kerakli_garov };

  // --- 1. Rasmiy ro'yxatdan o'tish ---
  if (p.shakl === "norasmiy") {
    topilmalar.push({
      kalit: "shakl",
      daraja: "tosiq",
      matn: "Biznes ro'yxatdan o'tmagan. Bank biznes kreditini rasmiy tadbirkorga beradi.",
      taxmin: true,
    });
    qadamlar.push({
      kalit: "royxat",
      sarlavha: "Biznesni ro'yxatdan o'tkazing",
      izoh: "Yakka tartibdagi tadbirkor (YaTT) yoki o'zini o'zi band qilgan sifatida. Qaysi biri sizga mosligini davlat xizmatlari markazida so'rang.",
    });
  } else if (p.shakl === "ozini_band") {
    topilmalar.push({
      kalit: "shakl",
      daraja: "ogohlantirish",
      matn: "O'zini o'zi band qilganlarga hamma bank ham biznes krediti bermaydi. Ular uchun alohida dasturlar bor — mos bankni quyida ko'rasiz.",
    });
  } else {
    topilmalar.push({
      kalit: "shakl",
      daraja: "yaxshi",
      matn: p.shakl === "yatt" ? "Yakka tartibdagi tadbirkor sifatida ro'yxatdan o'tgansiz." : "MChJ sifatida ro'yxatdan o'tgansiz.",
    });
  }

  // --- 2. Faoliyat muddati ---
  if (p.faoliyat_oy >= QOIDA.minFaoliyatOy) {
    topilmalar.push({
      kalit: "faoliyat_muddati",
      daraja: "yaxshi",
      matn: `${p.faoliyat_oy} oydan beri ishlaysiz. Bank odatda kamida ${QOIDA.minFaoliyatOy} oy so'raydi.`,
      manba: MANBALAR.kapitalbank,
    });
  } else {
    const qoldi = QOIDA.minFaoliyatOy - p.faoliyat_oy;
    topilmalar.push({
      kalit: "faoliyat_muddati",
      daraja: "tosiq",
      matn: `${p.faoliyat_oy} oydan beri ishlaysiz. Bank odatda kamida ${QOIDA.minFaoliyatOy} oy so'raydi: yana ${qoldi} oy kerak.`,
      manba: MANBALAR.kapitalbank,
    });
    qadamlar.push({
      kalit: "faoliyat_muddati",
      sarlavha: `Yana ${qoldi} oy ishlang`,
      izoh: "Shu vaqt ichida har oylik tushum va xarajatni yozib boring: bank pul oqimini so'raydi.",
      manba: MANBALAR.kapitalbank,
    });
  }

  // --- 3. Foyda (zarar bo'lmasligi kerak) ---
  if (oylik_foyda <= 0) {
    olmangSababi = "biznes hozir zarar bilan ishlayapti: xarajat tushumdan ko'p yoki teng";
    topilmalar.push({
      kalit: "foyda",
      daraja: "tosiq",
      matn: `Oylik xarajat (${somda(p.oylik_xarajat)}) tushumdan (${somda(p.oylik_tushum)}) kam emas. Bank zarar bilan ishlaydigan biznesga kredit bermaydi.`,
      manba: MANBALAR.kapitalbank,
    });
    qadamlar.push({
      kalit: "foyda",
      sarlavha: "Avval biznesni foydaga chiqaring",
      izoh: "Xarajatlarni qayta ko'rib chiqing. Qarz bilan zararni yopish zararni kattalashtiradi.",
    });
  } else {
    topilmalar.push({
      kalit: "foyda",
      daraja: "yaxshi",
      matn: `Oyiga taxminan ${somda(oylik_foyda)} foyda qolyapti.`,
      manba: MANBALAR.kapitalbank,
    });

    // --- 4. To'lov yuki (bizning hisobimiz) ---
    const ulush = oylik_tolov / oylik_foyda;
    const xavfsizSumma = mlnPastga(
      tolovgaMosSumma(oylik_foyda * QOIDA.tolovFoydaUlushiMax, yillik_stavka, p.kredit_muddat_oy),
    );
    if (ulush > 1) {
      olmangSababi = `oylik to'lov (${somda(oylik_tolov)}) oylik foydadan (${somda(oylik_foyda)}) katta`;
      topilmalar.push({
        kalit: "tolov_yuki",
        daraja: "tosiq",
        matn: `Oylik to'lov taxminan ${somda(oylik_tolov)}, foyda esa ${somda(oylik_foyda)}. Qarzni foydadan qaytara olmaysiz.`,
        manba: MANBALAR.stavka,
        taxmin: true,
      });
    } else if (ulush > QOIDA.tolovFoydaUlushiMax) {
      topilmalar.push({
        kalit: "tolov_yuki",
        daraja: "ogohlantirish",
        matn: `Oylik to'lov taxminan ${somda(oylik_tolov)} — foydaning ${Math.round(ulush * 100)} foizi. Biz yarmidan oshmasligini maslahat beramiz: savdo pasaysa, to'lay olmay qolasiz.`,
        manba: MANBALAR.stavka,
        taxmin: true,
      });
    } else {
      topilmalar.push({
        kalit: "tolov_yuki",
        daraja: "yaxshi",
        matn: `Oylik to'lov taxminan ${somda(oylik_tolov)} — foydaning ${Math.round(ulush * 100)} foizi.`,
        manba: MANBALAR.stavka,
        taxmin: true,
      });
    }
    if (ulush > QOIDA.tolovFoydaUlushiMax) {
      qadamlar.push({
        kalit: "summa",
        sarlavha:
          xavfsizSumma > 0
            ? `Summani ${somda(xavfsizSumma)} gacha kamaytiring`
            : "Summani kamaytiring yoki muddatni uzaytiring",
        izoh: `Shunda oylik to'lov foydaning yarmidan oshmaydi (${p.kredit_muddat_oy} oy muddatda, ${yillik_stavka} foiz taxminiy stavka bilan). Yoki muddatni uzaytiring.`,
        manba: MANBALAR.stavka,
      });
    }
  }

  // --- 5. Kredit tarixi ---
  if (p.kredit_tarixi === "yomon") {
    topilmalar.push({
      kalit: "kredit_tarixi",
      daraja: "tosiq",
      matn: "Kredit tarixida kechikish yoki to'lanmagan qarz bor. Bank salbiy tarixli mijozni odatda rad etadi.",
      manba: MANBALAR.kapitalbank,
    });
    qadamlar.push({
      kalit: "kredit_tarixi",
      sarlavha: "Eski qarzlarni to'liq yoping",
      izoh: "Kechikkan to'lovlarni yoping va kredit tarixingizni my.gov.uz da «Kredit tarixini olish» orqali tekshiring.",
      manba: MANBALAR.kapitalbank,
    });
  } else if (p.kredit_tarixi === "yoq") {
    topilmalar.push({
      kalit: "kredit_tarixi",
      daraja: "ogohlantirish",
      matn: "Kredit tarixingiz yo'q. Foiz kompensatsiyasi dasturida kredit tarixini shart qilish taqiqlangan.",
      manba: MANBALAR.kompensatsiya,
    });
  } else {
    topilmalar.push({
      kalit: "kredit_tarixi",
      daraja: "yaxshi",
      matn: "Kredit tarixingiz yaxshi.",
      manba: MANBALAR.kapitalbank,
    });
  }

  // --- 6. Garov ---
  const mikrokreditgaMos =
    p.avval_mikrokredit && p.kredit_tarixi === "yaxshi" && p.kredit_summa <= QOIDA.mikrokreditMax;
  if (p.garov_qiymati >= kerakli_garov) {
    topilmalar.push({
      kalit: "garov",
      daraja: "yaxshi",
      matn: `Garovingiz (${somda(p.garov_qiymati)}) yetarli: kamida ${somda(kerakli_garov)} kerak.`,
      manba: MANBALAR.kapitalbank,
    });
  } else if (mikrokreditgaMos) {
    topilmalar.push({
      kalit: "garov",
      daraja: "yaxshi",
      matn: `Garov yetmaydi, lekin siz garovsiz mikrokreditga mos kelishingiz mumkin: ${somda(QOIDA.mikrokreditMax)} gacha, ilgari mikrokredit olib vaqtida qaytarganlarga.`,
      manba: MANBALAR.mikrokredit,
    });
    qadamlar.push({
      kalit: "mikrokredit",
      sarlavha: "Bankdan garovsiz mikrokredit haqida so'rang",
      izoh: "Avvalgi mikrokreditni vaqtida qaytarganingizni aytib, shu dastur bo'yicha ariza bering.",
      manba: MANBALAR.mikrokredit,
    });
  } else {
    const yetmaydi = kerakli_garov - p.garov_qiymati;
    topilmalar.push({
      kalit: "garov",
      daraja: "tosiq",
      matn:
        p.garov_qiymati > 0
          ? `Garov yetmaydi: kamida ${somda(kerakli_garov)} kerak, sizda ${somda(p.garov_qiymati)}. Yana ${somda(yetmaydi)} yetishmaydi.`
          : `Garov yo'q. Bank odatda kredit summasining 125 foizicha garov so'raydi: ${somda(kerakli_garov)}.`,
      manba: MANBALAR.kapitalbank,
    });
    qadamlar.push({
      kalit: "kafolat",
      sarlavha: "Davlat kafolati bilan ariza bering",
      izoh: `Tadbirkorlikni rivojlantirish kompaniyasi garovi yetmaydiganlarga kredit summasining ${Math.round(QOIDA.kafolatUlushi * 100)} foizigacha kafolat beradi. Bankdan shu kafolat bilan ariza qabul qilishini so'rang.`,
      manba: MANBALAR.kafolat,
    });
    if (p.kredit_summa <= QOIDA.biznesStartMax) {
      topilmalar.push({
        kalit: "biznes_start",
        daraja: "ogohlantirish",
        matn: `Davlat yangi boshlaganlar uchun «Biznes start» dasturini e'lon qilgan: ${somda(QOIDA.biznesStartMax)} gacha garovsiz kredit. Qaysi bankda va qachondan ishlashi hali e'lon qilinmagan — bankdan so'rang.`,
        manba: MANBALAR.biznesStart,
        taxmin: true,
      });
    }
  }

  // --- 7. Elektron imzo (so'ralmaydi; tadbirkor aytgan bo'lsagina) ---
  if (p.eri_bor === true) {
    topilmalar.push({ kalit: "eri", daraja: "yaxshi", matn: "Elektron imzongiz bor." });
  } else if (p.eri_bor === false) {
    topilmalar.push({
      kalit: "eri",
      daraja: "ogohlantirish",
      matn: "Elektron imzo (ERI) yo'q. Onlayn ariza uchun u kerak bo'ladi.",
      taxmin: true,
    });
    qadamlar.push({
      kalit: "eri",
      sarlavha: "Elektron imzo (ERI) oling",
      izoh: "Elektron imzo — onlayn hujjatga qo'yiladigan shaxsiy imzo. Uni faqat o'zingiz ishlatasiz.",
    });
  }

  // --- Aniq mahsulot bilan kelishtirish ---
  // Umumiy talab (garov 125%, 6 oy) bajarilmasa ham, aniq bir mahsulot shartlarida ✗ bo'lmasa — bu to'siq emas.
  // Aks holda hukm «hali emas», mahsulot kartasi esa «mos» deb, bir-biriga zid gapiradi.
  const mosYol = olmangSababi ? undefined : mahsulotlar.find((m) => m.mos !== "mos_emas");
  const yol = mosYol ? `${mosYol.bank} «${mosYol.nom.replace(/[«»]/g, "")}»` : "";
  if (mosYol) {
    for (const t of topilmalar) {
      if (t.daraja === "tosiq" && (t.kalit === "garov" || t.kalit === "faoliyat_muddati")) {
        t.daraja = "ogohlantirish";
        t.matn += ` Lekin ${yol} shartlariga to'g'ri kelasiz.`;
      }
    }
    for (let i = qadamlar.length - 1; i >= 0; i--) {
      if (qadamlar[i].kalit === "kafolat" || qadamlar[i].kalit === "faoliyat_muddati") qadamlar.splice(i, 1);
    }
    // Mos bank bor — e'lon qilingan, lekin hali ishlamayotgan dastur haqidagi eslatma chalg'itadi.
    for (let i = topilmalar.length - 1; i >= 0; i--) {
      if (topilmalar[i].kalit === "biznes_start") topilmalar.splice(i, 1);
    }
    qadamlar.unshift({
      kalit: "hujjatlar",
      sarlavha: `${yol} uchun hujjatlarni yig'ing`,
      izoh: "Ro'yxat va har birini qayerdan olish «Hujjatlar» bo'limida. Rasmga olib yuklang — tekshirib, bitta papka qilamiz.",
      manba: mosYol.manba,
    });
  }

  // Umumiy qoidalar o'tsa ham, tekshirilgan mahsulotlardan hech biri to'g'ri kelmasa — «tayyor» demaymiz.
  if (!olmangSababi && mahsulotlar.length > 0 && !mosYol) {
    topilmalar.push({
      kalit: "mahsulot",
      daraja: "tosiq",
      matn: "Biz tekshirgan bank mahsulotlaridan hech biri hozir sizga to'liq to'g'ri kelmaydi. Kartada har birida nima yetishmasligi ko'rsatilgan.",
    });
  }

  // --- Hukm --- (hammasi tadbirkor aytgan raqamlarga tayanadi — matnda shuni aytamiz)
  const tosiqlar = topilmalar.filter((t) => t.daraja === "tosiq");
  let hukm: Hukm;
  let xulosa: string;
  if (olmangSababi) {
    hukm = "olmang";
    xulosa = `Siz aytgan raqamlarga ko'ra, hozircha ariza bermang: ${olmangSababi}. Avval shuni tuzating, keyin qayta tekshiramiz.`;
  } else if (tosiqlar.length > 0) {
    hukm = "hali_emas";
    xulosa = `Siz aytgan raqamlarga ko'ra, hali tayyor emassiz: ${tosiqlar.length} ta to'siq bor. Yo'l xaritasidagi qadamlarni bajarsangiz, ariza berishingiz mumkin.`;
  } else {
    hukm = "tayyor";
    xulosa = !mosYol
      ? "Siz aytgan raqamlarga ko'ra, asosiy talablarga javob berasiz. Endi hujjatlar kerak. Qarorni bank qiladi."
      : mosYol.mos === "mos"
        ? `Siz aytgan raqamlarga ko'ra, mos bank topildi: ${yol}. Endi hujjatlar kerak. Qarorni bank qiladi.`
        : `Siz aytgan raqamlarga ko'ra, eng yaqin bank: ${yol}. «?» belgili shartlarni bank ko'rib chiqishda tekshiradi. Hujjatlarni Yetak bilan tayyorlaymiz.`;
  }

  if (hukm !== "olmang") {
    qadamlar.push(
      mosYol
        ? {
            kalit: "ariza",
            sarlavha: `Hujjatlar tayyor bo'lgach, ${mosYol.bank}ga ariza bering`,
            izoh: "Roziligingiz bilan papka bank xodimi oynasiga tushadi. Hujjat yig'ib bankka qatnamaysiz; shartnomani bankda imzolaysiz.",
            manba: mosYol.manba,
          }
        : {
            kalit: "ariza",
            sarlavha: "TadbirCore yoki bankka ariza bering",
            izoh: "TadbirCore — bir arizani bir nechta bankka yuboradigan davlat platformasi. Arizani o'zingiz yuborasiz.",
            manba: MANBALAR.tadbircore,
          },
    );
  } else {
    qadamlar.push({
      kalit: "qayta_tekshirish",
      sarlavha: "Holat yaxshilangach qayta tekshiring",
      izoh: "Foyda oshganda yoki summani kamaytirganda Yetak'ga qayting — natijani qayta hisoblaymiz.",
    });
  }

  const belgilangan = new Set(bajarilgan);
  return {
    hukm,
    xulosa,
    topilmalar,
    qadamlar: qadamlar.map((q) => ({ ...q, bajarildi: belgilangan.has(q.kalit) })),
    hisob,
  };
}
