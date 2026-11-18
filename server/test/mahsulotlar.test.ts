import { describe, expect, it } from "vitest";
import type { Profil } from "../../shared/types";
import { mahsulotlarniMoslash } from "../src/mahsulotlar";

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
});
