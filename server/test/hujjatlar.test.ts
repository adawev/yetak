import { describe, expect, it } from "vitest";
import type { MahsulotMoslik, PapkaHujjat, Profil, YuklanganFayl } from "../../shared/types";
import manba from "../../docs/tadqiqot/hujjatlar.json";
import { ismlarniSolishtirish, mahsulotBankTekshiradi, mahsulotHujjatNomlari, papkadaBormi, papkaYasash, shartniOqish } from "../src/hujjatlar";
import { mahsulotlarniMoslash } from "../src/mahsulotlar";

const MLN = 1_000_000;
const mchj: Profil = { shakl: "mchj", faoliyat_oy: 24, kredit_tarixi: "yaxshi", kredit_summa: 300 * MLN, kredit_muddat_oy: 36, garov_qiymati: 100 * MLN };
const yatt: Profil = { shakl: "yatt", faoliyat_oy: 24, kredit_tarixi: "yaxshi", kredit_summa: 80 * MLN, kredit_muddat_oy: 24, garov_qiymati: 0 };

const yasash = (p: Profil, tanlov?: string, fayllar: Record<string, YuklanganFayl> = {}) =>
  papkaYasash(p, mahsulotlarniMoslash(p), tanlov, fayllar);
const kalitlar = (h: PapkaHujjat[]) => h.map((x) => x.kalit);

const fayl = (holat: "mos" | "muammo", egasi: string | null = null): YuklanganFayl => ({
  nom: "a.png",
  tur: "image/png",
  hajm: 10,
  vaqt: "2026-11-18T00:00:00Z",
  tekshiruv: { holat, hujjat_turi: "X", egasi, muammolar: holat === "mos" ? [] : ["xira"], izoh: "" },
});

describe("shartniOqish", () => {
  it("shartsiz — har doim kerak", () => {
    expect(shartniOqish(undefined, {})).toEqual({ kerak: true, matn: null });
  });
  it("yuridik_shaxs: MChJ kerak, YaTT kerak emas, noma'lum — 'MChJ bo'lsa'", () => {
    expect(shartniOqish("yuridik_shaxs", { shakl: "mchj" })).toEqual({ kerak: true, matn: null });
    expect(shartniOqish("yuridik_shaxs", { shakl: "yatt" }).kerak).toBe(false);
    expect(shartniOqish("yuridik_shaxs", {})).toEqual({ kerak: true, matn: "MChJ bo'lsa" });
  });
  it("100 mln dan oshgan qismi", () => {
    expect(shartniOqish("100 mln dan oshgan qismi", { kredit_summa: 100 * MLN }).kerak).toBe(false);
    expect(shartniOqish("100 mln dan oshgan qismi", { kredit_summa: 100 * MLN + 1 }).kerak).toBe(true);
    expect(shartniOqish("100 mln dan oshgan qismi", {}).kerak).toBe(true);
  });
  it("garov: 0 — kerak emas, >0 yoki noma'lum — kerak", () => {
    expect(shartniOqish("garov bo'lsa", { garov_qiymati: 0 }).kerak).toBe(false);
    expect(shartniOqish("garov bo'lsa", { garov_qiymati: 5 }).kerak).toBe(true);
    expect(shartniOqish("mulk garovga qo'yilsa", {}).kerak).toBe(true);
  });
  it("noma'lum shart matni o'zi qaytadi", () => {
    expect(shartniOqish("boshqa shart", {})).toEqual({ kerak: true, matn: "boshqa shart" });
  });
});

describe("papkaYasash", () => {
  it("MChJ 300 mln — Hamkorbank PQ-312: tasischi_qarori va garov bor", () => {
    const p = yasash(mchj)!;
    expect(p.mahsulot.kalit).toBe("hamkorbank_pq312");
    const k = kalitlar(p.hujjatlar);
    expect(k).toContain("tasischi_qarori");
    expect(k).toContain("garov");
  });
  it("YaTT 80 mln — MChJ hujjati ham, 100 mln dan oshgan garov ham yo'q", () => {
    const p = yasash(yatt, "hamkorbank_pq312")!;
    const k = kalitlar(p.hujjatlar);
    expect(k).not.toContain("tasischi_qarori");
    expect(k).not.toContain("garov");
  });
  it("kredit_tarixi tavsiya sifatida bir marta; bank_ozi_oladi yozuvlari bor", () => {
    const p = yasash(mchj, "hamkorbank_pq312")!;
    expect(p.hujjatlar.filter((h) => h.kalit === "kredit_tarixi")).toHaveLength(1);
    const bank = p.hujjatlar.filter((h) => h.bank_ozi_oladi);
    expect(bank.length).toBeGreaterThan(0);
    expect(bank.every((h) => h.kalit.startsWith("bank:") && h.fayl === null && h.olish === null)).toBe(true);
    expect(kalitlar(p.hujjatlar).filter((k) => k.includes("kredit_tarixi"))).toEqual(["kredit_tarixi"]);
  });
  it("pul_oqimi qoralamasi: raqamlar to'liq bo'lsa matn, aks holda null; boshqa hujjatda null", () => {
    const toliq: Profil = { ...mchj, oylik_tushum: 50 * MLN, oylik_xarajat: 30 * MLN };
    const p = yasash(toliq, "hamkorbank_pq312")!;
    const po = p.hujjatlar.find((h) => h.kalit === "pul_oqimi")!;
    expect(po.qoralama).toContain("Yetak");
    const QORALAMALI = ["pul_oqimi", "ariza", "tasischi_qarori", "daromad_manbalari"];
    expect(p.hujjatlar.filter((h) => !QORALAMALI.includes(h.kalit)).every((h) => h.qoralama === null)).toBe(true);
    expect(p.hujjatlar.find((h) => h.kalit === "ariza")!.qoralama).toContain("Yetak");
    expect(p.hujjatlar.find((h) => h.kalit === "tasischi_qarori")!.qoralama).toContain("Yetak");
    const yoq = yasash({ ...toliq, oylik_xarajat: undefined }, "hamkorbank_pq312")!;
    expect(yoq.hujjatlar.find((h) => h.kalit === "pul_oqimi")!.qoralama).toBeNull();
  });
  it("eri tavsiya faqat eri_bor === false bo'lganda", () => {
    const eri = (e?: boolean) => yasash({ ...mchj, eri_bor: e }, "hamkorbank_pq312")!.hujjatlar.find((h) => h.kalit === "eri");
    expect(eri(false)?.tavsiya).toBe(true);
    expect(eri(true)).toBeUndefined();
    expect(eri(undefined)).toBeUndefined();
  });
  it("tayyor/jami: olib boriladiganlar; tayyor — 'mos' fayl yoki (fayl yo'q bo'lsa) Yetak qoralamasi", () => {
    const bosh = yasash(mchj, "hamkorbank_pq312")!;
    const olib = bosh.hujjatlar.filter((h) => !h.bank_ozi_oladi && !h.tavsiya);
    expect(bosh.jami).toBe(olib.length);
    expect(bosh.tayyor).toBe(olib.filter((h) => h.qoralama).length);
    const [a, b, c] = olib.filter((h) => !h.qoralama);
    const p = yasash(mchj, "hamkorbank_pq312", {
      [a.kalit]: fayl("mos"),
      [b.kalit]: fayl("muammo"),
      [c.kalit]: { ...fayl("mos"), tekshiruv: null },
      kredit_tarixi: fayl("mos"), // tavsiya — sanalmaydi
    })!;
    expect(p.tayyor).toBe(1 + olib.filter((h) => h.qoralama).length);
    expect(p.jami).toBe(olib.length);
  });
  it("noto'g'ri tanlov — birinchi (eng mos) mahsulotga qaytadi", () => {
    expect(yasash(mchj, "yoq_mahsulot")!.mahsulot.kalit).toBe(mahsulotlarniMoslash(mchj)[0].kalit);
  });
  it("mahsulotlar yo'q — null; JSONda yo'q kalit — null", () => {
    expect(yasash({})).toBeNull();
    const soxta = { kalit: "yoq", bank: "B", nom: "N" } as MahsulotMoslik;
    expect(papkaYasash(mchj, [soxta], undefined, {})).toBeNull();
  });
  it("papkadaBormi: bank hujjati va noma'lum kalit — yo'q", () => {
    const p = yasash(mchj, "hamkorbank_pq312")!;
    expect(papkadaBormi(p, "ariza")).toBe(true);
    expect(papkadaBormi(p, "bank:kredit_tarixi")).toBe(false);
    expect(papkadaBormi(p, "yoq")).toBe(false);
    expect(papkadaBormi(null, "ariza")).toBe(false);
  });
  it("mahsulotHujjatNomlari / mahsulotBankTekshiradi", () => {
    expect(mahsulotHujjatNomlari("yoq", mchj)).toEqual([]);
    expect(mahsulotHujjatNomlari("hamkorbank_pq312", yatt).length).toBeGreaterThan(0);
    expect(mahsulotHujjatNomlari("hamkorbank_pq312", mchj).length).toBeGreaterThan(mahsulotHujjatNomlari("hamkorbank_pq312", yatt).length);
    expect(mahsulotBankTekshiradi("hamkorbank_pq312").length).toBeGreaterThan(0);
    expect(mahsulotBankTekshiradi("yoq")).toEqual([]);
  });
});

describe("ismlarniSolishtirish", () => {
  const h = (nom: string, egasi: string | null): PapkaHujjat => ({
    kalit: nom,
    nom,
    shart: null,
    bank_ozi_oladi: false,
    tavsiya: false,
    olish: null,
    qoralama: null,
    fayl: egasi ? fayl("mos", egasi) : null,
  });
  it("mos ism — ogohlantirish yo'q (tartib va registr farqi muhim emas)", () => {
    expect(ismlarniSolishtirish([h("Pasport", "Aliyev Vali"), h("Ijara", "VALI ALIYEV")])).toEqual([]);
  });
  it("farqli ism — ogohlantirish", () => {
    const r = ismlarniSolishtirish([h("Pasport", "Aliyev Vali"), h("Ijara", "Karimov Sanjar")]);
    expect(r).toHaveLength(1);
    expect(r[0]).toContain("Pasport");
  });
  it("lotin va kirill yozuvidagi bir xil ism — mos deb hisoblanadi", () => {
    expect(ismlarniSolishtirish([h("Pasport", "Aliyev Vali"), h("Ijara", "Алиев Вали")])).toHaveLength(0);
  });
  it("ismi yo'q hujjatlar o'tkazib yuboriladi", () => {
    expect(ismlarniSolishtirish([h("A", null), h("B", "Aliyev Vali")])).toEqual([]);
  });
});

describe("hujjatlar.json", () => {
  it("har bir hujjatning olish yo'li bor", () => {
    const hammasi = Object.entries((manba as unknown as { hujjatlar: Record<string, { olish?: unknown }> }).hujjatlar);
    expect(hammasi.length).toBeGreaterThan(0);
    for (const [k, v] of hammasi) expect(v.olish, k).toBeTruthy();
  });

  it("har hujjatda «qanday olish» qadamlari bor — agent «aniqlay olmadik» demasin", () => {
    const hammasi = Object.entries((manba as unknown as { hujjatlar: Record<string, { olish: { qadamlar: string[] } }> }).hujjatlar);
    for (const [k, v] of hammasi) expect(v.olish.qadamlar.length, k).toBeGreaterThan(0);
  });
});

describe("bank bo'yicha hujjat yo'li", () => {
  it("TBC tanlansa — ariza TBC Business ilovasida, manba bank sahifasi", () => {
    const papka = yasash(yatt, "tbc_onlayn")!;
    const ariza = papka.hujjatlar.find((h) => h.kalit === "ariza")!;
    expect(ariza.olish!.qayerda).toContain("TBC Business");
    expect(ariza.olish!.manba).toContain("tbcbank.uz");
  });

  it("boshqa bankda ariza — umumiy yo'l, TBC qadamlari aralashmaydi", () => {
    const ariza = yasash(mchj)!.hujjatlar.find((h) => h.kalit === "ariza")!;
    expect(ariza.olish!.qayerda).not.toContain("TBC");
  });
});
