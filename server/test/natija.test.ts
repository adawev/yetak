import { describe, expect, it } from "vitest";
import type { Profil } from "../../shared/types";
import { mahsulotlarniMoslash } from "../src/mahsulotlar";
import { natijaHisobla } from "../src/natija";
import { papkaYasash } from "../src/hujjatlar";

const nonvoy: Profil = {
  faoliyat: "non sexi",
  shakl: "yatt",
  faoliyat_oy: 14,
  oylik_tushum: 40_000_000,
  oylik_xarajat: 28_000_000,
  kredit_summa: 80_000_000,
  kredit_muddat_oy: 24,
  maqsad: "tandir",
  garov_qiymati: 0,
  kredit_tarixi: "yoq",
  eri_bor: true,
};

describe("natija va mahsulot bir-biriga zid emas", () => {
  it("garov yo'q, lekin Hamkorbank 100 mln gacha garovsiz — garov to'siq emas, hukm papkadagi bank bilan", () => {
    const n = natijaHisobla(nonvoy)!;
    const garov = n.topilmalar.find((t) => t.kalit === "garov")!;
    expect(garov.daraja).toBe("ogohlantirish");
    expect(n.hukm).toBe("tayyor");
    const papka = papkaYasash(nonvoy, mahsulotlarniMoslash(nonvoy), undefined, {})!;
    expect(n.xulosa).toContain(papka.mahsulot.bank);
    expect(n.qadamlar[0].kalit).toBe("hujjatlar");
    expect(n.qadamlar.some((q) => q.kalit === "kafolat")).toBe(false);
  });

  it("zarar bilan ishlasa — mahsulot bo'lsa ham «olmang»", () => {
    const n = natijaHisobla({ ...nonvoy, oylik_xarajat: 45_000_000 })!;
    expect(n.hukm).toBe("olmang");
    expect(n.qadamlar.some((q) => q.kalit === "hujjatlar")).toBe(false);
  });

  it("hech bir mahsulot mos kelmasa — eski umumiy qoida ishlaydi", () => {
    const n = natijaHisobla({ ...nonvoy, kredit_summa: 2_000_000_000, kredit_muddat_oy: 120 })!;
    expect(n.topilmalar.find((t) => t.kalit === "garov")!.daraja).toBe("tosiq");
  });
});
