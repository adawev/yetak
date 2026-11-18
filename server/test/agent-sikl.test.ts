// Agent sikli: Claude javoblari soxta, qolgani (asboblar, qoidalar, citations) haqiqiy.
import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { ClaudeAgent } from "../src/agent";
import { KORPUS } from "../src/korpus.generated";
import { NAMUNALAR } from "../src/namunalar";
import { baholash } from "../src/rules";

type Javob = { stop_reason: string; content: unknown[] };

function soxtaMijoz(javoblar: Javob[]) {
  const sorovlar: { messages: Anthropic.Beta.BetaMessageParam[] }[] = [];
  const mijoz = {
    beta: {
      messages: {
        create: async (p: { messages: Anthropic.Beta.BetaMessageParam[] }) => {
          sorovlar.push(structuredClone(p));
          const j = javoblar.shift();
          if (!j) throw new Error("javob tugadi");
          return { ...j, model: "soxta", usage: { input_tokens: 1, output_tokens: 1 } };
        },
      },
    },
  };
  return { mijoz: mijoz as unknown as Anthropic, sorovlar };
}

const tool = (id: string, name: string, input: unknown) => ({ type: "tool_use", id, name, input });

describe("ClaudeAgent sikli", () => {
  it("profil → bloklar → citations bilan matn", async () => {
    const p = NAMUNALAR.hali_emas;
    const { mijoz, sorovlar } = soxtaMijoz([
      { stop_reason: "tool_use", content: [{ type: "text", text: "e'tiborsiz" }, tool("t1", "profilni_saqlash", p)] },
      {
        stop_reason: "tool_use",
        content: [
          tool("t2", "korsatish", { bloklar: ["hukm", "garov"], atama: { atama: "Kafolat", izoh: "Davlat kafilligi." } }),
          tool("t3", "tugmalar", { tugmalar: ["Birinchi qadam nima?", ""] }),
        ],
      },
      {
        stop_reason: "end_turn",
        content: [
          { type: "text", text: "Garovingiz yetmaydi. ", citations: null },
          {
            type: "text",
            text: "Kafolat dasturi bor.",
            citations: [{ type: "char_location", cited_text: "75 foizigacha", document_index: 0 }],
          },
        ],
      },
    ]);
    const j = await new ClaudeAgent(mijoz).javob({
      xabarlar: [{ kim: "tadbirkor", matn: "Hammasini aytdim", vaqt: "2026-11-17T00:00:00Z" }],
      profil: {},
      bajarilgan: [],
    });

    expect(j.matn).toBe("Garovingiz yetmaydi. Kafolat dasturi bor.");
    expect(j.tugmalar).toEqual(["Birinchi qadam nima?"]);
    expect(j.profil.kredit_summa).toBe(p.kredit_summa);
    const n = baholash(j.profil)!;
    expect(j.bloklar).toEqual([
      { tur: "hukm" },
      { tur: "garov", bor: p.garov_qiymati, kerak: n.hisob.kerakli_garov },
      { tur: "atama", atama: "Kafolat", izoh: "Davlat kafilligi." },
    ]);
    expect(j.manbalar).toEqual([{ nom: KORPUS[0].nom, url: KORPUS[0].url, parcha: "75 foizigacha" }]);

    // RAG: korpus birinchi xabarda, citations yoqilgan, oxirgisi keshlanadi
    const birinchi = sorovlar[0].messages[0].content as { type: string; citations?: unknown; cache_control?: unknown }[];
    const docs = birinchi.filter((b) => b.type === "document");
    expect(docs).toHaveLength(KORPUS.length);
    expect(docs.every((d) => (d.citations as { enabled: boolean }).enabled)).toBe(true);
    expect(docs.at(-1)?.cache_control).toEqual({ type: "ephemeral" });
    expect(sorovlar).toHaveLength(3);
  });

  it("asbobdan keyin matn qayta yozilsa — bir marta chiqadi", async () => {
    const { mijoz } = soxtaMijoz([
      {
        stop_reason: "tool_use",
        content: [{ type: "text", text: "Necha oy ishlagansiz?" }, tool("t1", "tugmalar", { tugmalar: ["6 oy", "1 yil"] })],
      },
      { stop_reason: "end_turn", content: [{ type: "text", text: "Necha oy ishlagansiz?" }] },
    ]);
    const j = await new ClaudeAgent(mijoz).javob({
      xabarlar: [{ kim: "tadbirkor", matn: "MChJ", vaqt: "2026-11-18T00:00:00Z" }],
      profil: {},
      bajarilgan: [],
    });
    expect(j.matn).toBe("Necha oy ishlagansiz?");
    expect(j.tugmalar).toEqual(["6 oy", "1 yil"]);
  });

  it("matnsiz yakun — tushunarli xato", async () => {
    const { mijoz } = soxtaMijoz([{ stop_reason: "end_turn", content: [] }]);
    await expect(
      new ClaudeAgent(mijoz).javob({
        xabarlar: [{ kim: "tadbirkor", matn: "salom", vaqt: "2026-11-17T00:00:00Z" }],
        profil: {},
        bajarilgan: [],
      }),
    ).rejects.toMatchObject({ status: 502 });
  });
});
