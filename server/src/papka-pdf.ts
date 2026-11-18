// Bitta PDF papka: muqova (mahsulot, tadbirkor holati, hujjatlar ro'yxati) + yuklangan hujjatlar.
// Hujjatlar o'zgartirilmaydi — rasm sahifaga joylanadi, PDF sahifalari aynan ko'chiriladi.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Papka, Profil } from "../../shared/types";
import { somda } from "./rules";

const A4: [number, number] = [595.28, 841.89];
const CHET = 50;

const KIRILL: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh",
  щ: "sh", ъ: "'", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", ў: "o'", қ: "q", ғ: "g'", ҳ: "h",
};

/** Standart shrift (WinAnsi) faqat lotin harflarini chizadi: kirill — lotinga, qolgani — '?'. */
export function matnTozala(s: string): string {
  let r = "";
  for (const ch of s.replace(/[ʻʼ‘’`]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-")) {
    const kichik = ch.toLowerCase();
    if (KIRILL[kichik] !== undefined) {
      const t = KIRILL[kichik];
      r += ch === kichik ? t : t.charAt(0).toUpperCase() + t.slice(1);
    } else if (/[\x20-\x7E«»]/.test(ch)) r += ch;
    else if (ch === "\n") r += " ";
    else r += "?";
  }
  return r;
}

class Yozuvchi {
  page: PDFPage;
  y: number;
  constructor(
    private doc: PDFDocument,
    private font: PDFFont,
    private qalin: PDFFont,
  ) {
    this.page = doc.addPage(A4);
    this.y = A4[1] - CHET;
  }
  private joy(h: number) {
    if (this.y - h < CHET) {
      this.page = this.doc.addPage(A4);
      this.y = A4[1] - CHET;
    }
  }
  qator(matn: string, o: { size?: number; bold?: boolean; rang?: [number, number, number]; chekinish?: number } = {}) {
    const size = o.size ?? 10.5;
    const f = o.bold ? this.qalin : this.font;
    const x = CHET + (o.chekinish ?? 0);
    const kenglik = A4[0] - CHET - x;
    const sozlar = matnTozala(matn).split(" ");
    let joriy = "";
    const qatorlar: string[] = [];
    for (const s of sozlar) {
      const sinov = joriy ? `${joriy} ${s}` : s;
      if (f.widthOfTextAtSize(sinov, size) > kenglik && joriy) {
        qatorlar.push(joriy);
        joriy = s;
      } else joriy = sinov;
    }
    if (joriy) qatorlar.push(joriy);
    for (const q of qatorlar) {
      this.joy(size + 4);
      this.page.drawText(q, { x, y: this.y - size, size, font: f, color: rgb(...(o.rang ?? [0.1, 0.12, 0.18])) });
      this.y -= size + 4;
    }
  }
  yangiSahifa() {
    this.page = this.doc.addPage(A4);
    this.y = A4[1] - CHET;
  }
  bosh(h = 8) {
    this.y -= h;
  }
}

export interface PapkaFayli {
  kalit: string;
  nom: string;
  tur: string;
  data: Buffer;
}

export interface PulOqimiKirish {
  oylik_tushum: number;
  oylik_xarajat: number;
  oylik_tolov: number;
  yillik_stavka: number;
  muddat_oy: number;
  summa: number;
}

/** Pul oqimi qoralamasi sahifasi: birinchi 12 oy (yoki muddat qisqa bo'lsa — shuncha). Hisobni kod qiladi. */
function pulOqimiSahifa(w: Yozuvchi, qalin: PDFFont, font: PDFFont, po: PulOqimiKirish) {
  const kulrang: [number, number, number] = [0.42, 0.45, 0.5];
  w.yangiSahifa();
  w.qator("Pul oqimi prognozi (qoralama)", { size: 18, bold: true });
  w.qator(
    "Tadbirkor aytgan o'rtacha oylik raqamlar asosida. Mavsumiy o'zgarish hisobga olinmagan. Yakuniy shaklni bank beradi.",
    { size: 9.5, rang: kulrang },
  );
  w.bosh(10);
  const xlar = [CHET, CHET + 50, CHET + 170, CHET + 290, CHET + 400];
  const sarlavha = ["Oy", "Tushum", "Xarajat", "Kredit to'lovi", "Qoladi"];
  const qator = (v: string[], f: PDFFont, rang: [number, number, number] = [0.1, 0.12, 0.18]) => {
    v.forEach((t, i) => w.page.drawText(matnTozala(t), { x: xlar[i], y: w.y - 10, size: 9.5, font: f, color: rgb(...rang) }));
    w.y -= 16;
  };
  qator(sarlavha, qalin);
  w.page.drawLine({ start: { x: CHET, y: w.y + 3 }, end: { x: A4[0] - CHET, y: w.y + 3 }, thickness: 0.7, color: rgb(0.6, 0.62, 0.66) });
  w.bosh(3);
  const oylar = Math.min(12, Math.max(0, Math.floor(po.muddat_oy)));
  for (let i = 1; i <= oylar; i++) {
    const qoladi = po.oylik_tushum - po.oylik_xarajat - po.oylik_tolov;
    qator(
      [String(i), somda(po.oylik_tushum), somda(po.oylik_xarajat), somda(po.oylik_tolov), somda(qoladi)],
      font,
      qoladi < 0 ? [0.7, 0.3, 0.1] : [0.1, 0.12, 0.18],
    );
  }
  w.bosh(8);
  w.qator(
    `Oylik to'lov - ${po.yillik_stavka}% taxminiy stavka bilan hisoblangan (annuitet). Bankning haqiqiy foizi boshqacha bo'lishi mumkin.`,
    { size: 9, rang: kulrang },
  );
}

export async function papkaPdf(k: {
  papka: Papka;
  profil: Profil;
  fayllar: PapkaFayli[];
  sana: string;
  pulOqimi?: PulOqimiKirish;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(matnTozala(`Kredit hujjatlari papkasi - ${k.papka.mahsulot.bank}`));
  doc.setProducer("Yetak");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const qalin = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new Yozuvchi(doc, font, qalin);
  const kulrang: [number, number, number] = [0.42, 0.45, 0.5];

  w.qator("YETAK", { size: 11, bold: true, rang: [0.85, 0.45, 0.1] });
  w.qator("Kredit hujjatlari papkasi", { size: 22, bold: true });
  w.qator(`${k.papka.mahsulot.bank} - ${k.papka.mahsulot.nom}`, { size: 13 });
  w.qator(`Tayyorlangan sana: ${k.sana}`, { size: 9.5, rang: kulrang });
  w.bosh(14);

  const p = k.profil;
  const shakl = { yatt: "Yakka tartibdagi tadbirkor (YaTT)", mchj: "MChJ", ozini_band: "O'zini o'zi band qilgan", norasmiy: "Ro'yxatdan o'tmagan" };
  w.qator("Tadbirkor haqida (o'zi aytgan ma'lumot)", { size: 13, bold: true });
  const qatorlar: [string, string | undefined][] = [
    ["Faoliyat", p.faoliyat],
    ["Shakl", p.shakl ? shakl[p.shakl] : undefined],
    ["Necha oydan beri ishlaydi", p.faoliyat_oy != null ? `${p.faoliyat_oy} oy` : undefined],
    ["Oylik tushum", p.oylik_tushum != null ? somda(p.oylik_tushum) : undefined],
    ["Oylik xarajat", p.oylik_xarajat != null ? somda(p.oylik_xarajat) : undefined],
    ["Kerakli summa", p.kredit_summa != null ? somda(p.kredit_summa) : undefined],
    ["Muddat", p.kredit_muddat_oy != null ? `${p.kredit_muddat_oy} oy` : undefined],
    ["Maqsad", p.maqsad],
    ["Garov qiymati", p.garov_qiymati != null ? somda(p.garov_qiymati) : undefined],
  ];
  for (const [n, v] of qatorlar) if (v) w.qator(`${n}: ${v}`, { chekinish: 8 });
  w.qator("Raqamlarni tadbirkor o'zi aytgan. Bank ularni o'z tizimi orqali tekshiradi.", { size: 9, rang: kulrang });
  w.bosh(14);

  w.qator("Hujjatlar", { size: 13, bold: true });
  w.qator(`Olib boriladigan hujjatlar: ${k.papka.tayyor} / ${k.papka.jami} tasi tekshiruvdan o'tgan`, { size: 10, rang: kulrang });
  w.bosh(4);
  for (const h of k.papka.hujjatlar) {
    const belgi = h.bank_ozi_oladi
      ? "[bank]"
      : !h.fayl
        ? "[ yo'q ]"
        : h.fayl.tekshiruv?.holat === "mos"
          ? "[+ bor]"
          : h.fayl.tekshiruv
            ? "[! muammo]"
            : "[bor]";
    w.qator(`${belgi}  ${h.nom}${h.shart && !h.tavsiya ? ` - ${h.shart}` : ""}`, { chekinish: 8, bold: !h.bank_ozi_oladi });
    if (h.bank_ozi_oladi) w.qator("Bank o'zi davlat tizimidan oladi", { chekinish: 60, size: 9, rang: kulrang });
    for (const m of h.fayl?.tekshiruv?.muammolar ?? []) w.qator(`- ${m}`, { chekinish: 60, size: 9, rang: [0.7, 0.3, 0.1] });
  }
  for (const o of k.papka.ogohlantirishlar) {
    w.bosh(4);
    w.qator(`Diqqat: ${o}`, { size: 9.5, rang: [0.7, 0.3, 0.1] });
  }
  w.bosh(14);
  w.qator(
    "Hujjatlar tadbirkor yuklagan ko'rinishda, o'zgartirishsiz ilova qilingan. Sun'iy intellekt faqat o'qilishi va turini tekshirgan. Kredit qarorini bank qiladi.",
    { size: 9, rang: kulrang },
  );

  if (k.pulOqimi) pulOqimiSahifa(w, qalin, font, k.pulOqimi);

  for (const f of k.fayllar) {
    try {
      if (f.tur === "application/pdf") {
        const manba = await PDFDocument.load(f.data, { ignoreEncryption: true });
        const sahifalar = await doc.copyPages(manba, manba.getPageIndices());
        sahifalar.forEach((s) => doc.addPage(s));
      } else {
        const rasm = f.tur === "image/png" ? await doc.embedPng(f.data) : await doc.embedJpg(f.data);
        const page = doc.addPage(A4);
        page.drawText(matnTozala(f.nom), { x: CHET, y: A4[1] - CHET, size: 11, font: qalin });
        const maxW = A4[0] - 2 * CHET;
        const maxH = A4[1] - 2 * CHET - 24;
        const k2 = Math.min(maxW / rasm.width, maxH / rasm.height, 1);
        const rw = rasm.width * k2;
        const rh = rasm.height * k2;
        page.drawImage(rasm, { x: (A4[0] - rw) / 2, y: A4[1] - CHET - 24 - rh, width: rw, height: rh });
      }
    } catch {
      const page = doc.addPage(A4);
      page.drawText(matnTozala(`${f.nom}: faylni papkaga qo'shib bo'lmadi, alohida olib boring.`), {
        x: CHET,
        y: A4[1] - CHET,
        size: 11,
        font,
      });
    }
  }
  return doc.save();
}
