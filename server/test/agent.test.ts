import { describe, expect, it } from "vitest";
import { bloklarniYasash, matnVaManbalar } from "../src/agent";
import { KORPUS } from "../src/korpus.generated";
import { NAMUNALAR } from "../src/namunalar";
import { baholash } from "../src/rules";

describe("bloklarniYasash", () => {
  it("raqamlarni profil va natijadan oladi, agentdan emas", () => {
    const p = NAMUNALAR.hali_emas;
    const n = baholash(p)!;
    const { bloklar, yoq } = bloklarniYasash(
      { bloklar: ["kredit_summa", "pul_oqimi", "garov", "hukm"], atama: { atama: "Garov", izoh: "Mol-mulk." } },
      p,
      n,
    );
    expect(yoq).toEqual([]);
    expect(bloklar).toContainEqual({ tur: "summa", sarlavha: "Kerakli summa", qiymat: p.kredit_summa });
    expect(bloklar).toContainEqual({
      tur: "pul_oqimi",
      tushum: p.oylik_tushum,
      xarajat: p.oylik_xarajat,
      foyda: n.hisob.oylik_foyda,
      tolov: n.hisob.oylik_tolov,
    });
    expect(bloklar).toContainEqual({ tur: "garov", bor: p.garov_qiymati, kerak: n.hisob.kerakli_garov });
    expect(bloklar).toContainEqual({ tur: "atama", atama: "Garov", izoh: "Mol-mulk." });
  });

  it("natija yo'q bo'lsa hisobga bog'liq bloklar chiqmaydi", () => {
    const { bloklar, yoq } = bloklarniYasash({ bloklar: ["pul_oqimi", "hukm"], atama: null }, {}, null);
    expect(bloklar).toEqual([]);
    expect(yoq).toEqual(["pul_oqimi", "hukm"]);
  });
});

describe("matnVaManbalar", () => {
  it("citations'dan korpus hujjati va keltirilgan parchani oladi", () => {
    const { matn, manbalar } = matnVaManbalar([
      { type: "text", text: "Garov yetmasa ", citations: null },
      {
        type: "text",
        text: "kafolat dasturi bor.",
        citations: [
          {
            type: "char_location",
            cited_text: "Kredit summasining 75 foizigacha",
            document_index: 0,
            document_title: KORPUS[0].nom,
            start_char_index: 0,
            end_char_index: 10,
            file_id: null,
          },
        ],
      },
    ] as never);
    expect(matn).toBe("Garov yetmasa kafolat dasturi bor.");
    expect(manbalar).toEqual([{ nom: KORPUS[0].nom, url: KORPUS[0].url, parcha: "Kredit summasining 75 foizigacha" }]);
  });
});
