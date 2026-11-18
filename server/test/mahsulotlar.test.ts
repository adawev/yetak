import { describe, expect, it } from "vitest";
import type { Profil } from "../../shared/types";
import { mahsulotlarniMoslash } from "../src/mahsulotlar";
import { oylikTolov } from "../src/rules";

const holatlar = (p: Profil, kalit: string) =>
  mahsulotlarniMoslash(p)
    .find((m) => m.kalit === kalit)!
    .shartlar.map((s) => s.holat);

describe("mahsulotlarniMoslash", () => {
  it("shakl yoki summa noma'lum bo'lsa — bo'sh", () => {
    expect(mahsulotlarniMoslash({})).toEqual([]);
    expect(mahsulotlarniMoslash({ shakl: "yatt" })).toEqual([]);
  });

  it("MChJ, 300 mln, garov 100 mln, tarix yaxshi — Hamkorbank birinchi, garov qismi bank baholaydi", () => {
    const p: Profil = {
      shakl: "mchj",
      faoliyat_oy: 24,
      kredit_tarixi: "yaxshi",
      kredit_summa: 300_000_000,
      kredit_muddat_oy: 36,
      garov_qiymati: 100_000_000,
    };
    const r = mahsulotlarniMoslash(p);
    expect(r[0].kalit).toBe("hamkorbank_pq312");
    expect(r[0].mos).toBe("qisman");
    const garov = r[0].shartlar.find((s) => s.matn.includes("garov kerak"))!;
    expect(garov.holat).toBe("nomalum");
    expect(garov.matn).toContain("200 000 000 so'm");
    // Ipak Yo'li: faqat YaTT va 200 mln gacha — mos emas
    expect(r.find((m) => m.kalit === "ipakyoli_onlayn")!.mos).toBe("mos_emas");
  });

  it("garov yo'q va summa 100 mln dan katta — Hamkorbank garov sharti ✗", () => {
    const p: Profil = { shakl: "yatt", faoliyat_oy: 14, kredit_tarixi: "yoq", kredit_summa: 120_000_000, garov_qiymati: 0 };
    expect(holatlar(p, "hamkorbank_pq312")).toContain("yoq");
  });

  it("YaTT, 1 yildan ortiq, 150 mln, 12 oy — Ipak Yo'li faqat hisob raqami noma'lum", () => {
    const p: Profil = { shakl: "yatt", faoliyat_oy: 18, kredit_summa: 150_000_000, kredit_muddat_oy: 12 };
    const ipak = mahsulotlarniMoslash(p).find((m) => m.kalit === "ipakyoli_onlayn")!;
    expect(ipak.mos).toBe("qisman");
    expect(ipak.shartlar.filter((s) => s.holat === "nomalum")).toHaveLength(1);
  });

  it("o'zini o'zi band, 40 mln, garov yetarli — Mikrokreditbank sharti ✓", () => {
    const p: Profil = { shakl: "ozini_band", kredit_summa: 40_000_000, kredit_muddat_oy: 36, garov_qiymati: 60_000_000 };
    expect(holatlar(p, "mikrokreditbank_birinchi_qadam").slice(0, 4)).toEqual(["ha", "ha", "ha", "ha"]);
  });

  it("kredit tarixi yomon — Hamkorbank ✗", () => {
    const p: Profil = { shakl: "yatt", faoliyat_oy: 24, kredit_tarixi: "yomon", kredit_summa: 80_000_000 };
    expect(mahsulotlarniMoslash(p).find((m) => m.kalit === "hamkorbank_pq312")!.mos).toBe("mos_emas");
  });

  it("taklif: Hamkorbank PQ-312 — foiz 18–24, to'lov yuqori foizda; mos emas — null; foizi yo'q — null", () => {
    const p: Profil = { shakl: "mchj", faoliyat_oy: 24, kredit_tarixi: "yaxshi", kredit_summa: 300_000_000, kredit_muddat_oy: 36, garov_qiymati: 300_000_000 };
    const r = mahsulotlarniMoslash(p);
    expect(r.find((m) => m.kalit === "hamkorbank_pq312")!.taklif).toEqual({
      summa: 300_000_000,
      foiz_min: 18,
      foiz_max: 24,
      muddat_oy: 36,
      oylik_tolov: Math.round(oylikTolov(300_000_000, 24, 36)),
      izoh: expect.stringContaining("100 mln gacha qismiga"),
    });
    expect(r.find((m) => m.kalit === "ipakyoli_onlayn")!.taklif).toBeNull(); // mos emas (faqat YaTT)
    expect(r.find((m) => m.kalit === "kapitalbank_standart")!.taklif).toBeNull(); // foiz manbada yo'q
  });

  it("taklif: Mikrokreditbank 40 mln, 36 oy — 21%, summa chegaradan oshmaydi", () => {
    const p: Profil = { shakl: "ozini_band", kredit_summa: 40_000_000, kredit_muddat_oy: 36, garov_qiymati: 60_000_000 };
    const t = mahsulotlarniMoslash(p).find((m) => m.kalit === "mikrokreditbank_birinchi_qadam")!.taklif!;
    expect(t.summa).toBeLessThanOrEqual(50_000_000);
    expect(t.foiz_max).toBe(21);
    expect(t.oylik_tolov).toBe(Math.round(oylikTolov(40_000_000, 21, 36)));
  });

  it("2 oylik o'zini band — ko'proq «ha» bo'lgan Biznesga qadam birinchi", () => {
    const p: Profil = { shakl: "ozini_band", faoliyat_oy: 2, oylik_tushum: 8e6, oylik_xarajat: 3e6, kredit_summa: 15e6, kredit_muddat_oy: 24, garov_qiymati: 0, kredit_tarixi: "yoq", eri_bor: false };
    expect(mahsulotlarniMoslash(p)[0].kalit).toBe("hamkorbank_biznesga_qadam");
  });
});
