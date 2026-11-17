import { describe, expect, it } from "vitest";
import { NAMUNALAR } from "../src/namunalar";
import { baholash, oylikTolov, tolovgaMosSumma, yetishmayotgan } from "../src/rules";

describe("baholash", () => {
  it("profil to'liq bo'lmasa null", () => {
    expect(baholash({ faoliyat: "do'kon" })).toBeNull();
  });

  it("uch xil hukm", () => {
    expect(baholash(NAMUNALAR.tayyor)?.hukm).toBe("tayyor");
    expect(baholash(NAMUNALAR.hali_emas)?.hukm).toBe("hali_emas");
    expect(baholash(NAMUNALAR.olmang)?.hukm).toBe("olmang");
  });

  it("zarar bo'lsa olmang", () => {
    const n = baholash({ ...NAMUNALAR.tayyor, oylik_xarajat: 70_000_000 })!;
    expect(n.hukm).toBe("olmang");
    expect(n.hisob.oylik_foyda).toBe(-10_000_000);
  });

  it("6 oydan kam — hali emas, nechta oy qolgani aytiladi", () => {
    const n = baholash({ ...NAMUNALAR.tayyor, faoliyat_oy: 4 })!;
    expect(n.hukm).toBe("hali_emas");
    expect(n.qadamlar.find((q) => q.kalit === "faoliyat_muddati")?.sarlavha).toContain("2 oy");
  });

  it("garovsiz mikrokredit yo'li", () => {
    const n = baholash({
      ...NAMUNALAR.tayyor,
      garov_qiymati: 0,
      avval_mikrokredit: true,
      kredit_summa: 50_000_000,
    })!;
    expect(n.hukm).toBe("tayyor");
    expect(n.qadamlar.some((q) => q.kalit === "mikrokredit")).toBe(true);
  });

  it("garov yetmasa kafolat qadami, manbasi bilan", () => {
    const n = baholash(NAMUNALAR.hali_emas)!;
    const q = n.qadamlar.find((q) => q.kalit === "kafolat");
    expect(q?.manba?.url).toContain("gov.uz");
  });

  it("hisob: garov 125%, to'lov annuitet", () => {
    const n = baholash(NAMUNALAR.tayyor)!;
    expect(n.hisob.kerakli_garov).toBe(125_000_000);
    expect(n.hisob.oylik_tolov).toBe(Math.round(oylikTolov(100_000_000, 20.4, 24)));
    expect(n.hisob.oylik_tolov).toBeGreaterThan(100_000_000 / 24);
  });

  it("katta to'lov — xavfsiz summa taklif qilinadi va u yarim foydaga sig'adi", () => {
    const p = { ...NAMUNALAR.tayyor, kredit_summa: 300_000_000 };
    const n = baholash(p)!;
    const q = n.qadamlar.find((q) => q.kalit === "summa")!;
    expect(q).toBeDefined();
    const max = tolovgaMosSumma(10_000_000, 20.4, 24);
    expect(oylikTolov(Math.floor(max / 1e6) * 1e6, 20.4, 24)).toBeLessThanOrEqual(10_000_000);
  });

  it("bajarilgan qadamlar belgilanadi", () => {
    const n = baholash(NAMUNALAR.hali_emas, ["eri"])!;
    expect(n.qadamlar.find((q) => q.kalit === "eri")?.bajarildi).toBe(true);
    expect(n.qadamlar.find((q) => q.kalit === "kafolat")?.bajarildi).toBe(false);
  });

  it("har bir taxmin bo'lmagan topilmada manba bor (eri va shakl yaxshi holatidan tashqari)", () => {
    for (const p of Object.values(NAMUNALAR)) {
      for (const t of baholash(p)!.topilmalar) {
        if (t.daraja === "yaxshi" && (t.kalit === "eri" || t.kalit === "shakl")) continue;
        expect(t.manba || t.taxmin, `${t.kalit}: manba yoki taxmin belgisi kerak`).toBeTruthy();
      }
    }
  });

  it("mikrokredit savoli faqat garovsiz yo'l ochiq bo'lsa kerak", () => {
    const { avval_mikrokredit: _, ...garovli } = NAMUNALAR.tayyor;
    expect(yetishmayotgan(garovli)).toEqual([]);
    expect(baholash(garovli)?.hukm).toBe("tayyor");
    const garovsiz = { ...garovli, garov_qiymati: 0, kredit_tarixi: "yaxshi" as const };
    expect(yetishmayotgan(garovsiz)).toEqual(["avval_mikrokredit"]);
    expect(baholash(garovsiz)).toBeNull();
  });
});
