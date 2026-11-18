import { describe, expect, it } from "vitest";
import type { HujjatTekshiruvi, SessiyaHolati } from "../../shared/types";
import { appYaratish, faylTuri } from "../src/app";
import { NAMUNALAR } from "../src/namunalar";
import { PDFDocument } from "pdf-lib";
import { matnTozala, papkaPdf } from "../src/papka-pdf";
import { qoralamaSahifa } from "../src/qoralamalar";
import { papkaYasash } from "../src/hujjatlar";
import { mahsulotlarniMoslash } from "../src/mahsulotlar";
import { XotiraFaylOmbor, XotiraStore } from "../src/store";
import { hukmChiqarish, type HujjatTekshiruvchi } from "../src/tekshiruv";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
const MOS: HujjatTekshiruvi = { holat: "mos", hujjat_turi: "Ariza", egasi: "Aliyev Vali", muammolar: [], izoh: "Yaxshi." };

const soxta: HujjatTekshiruvchi = { tekshir: async () => MOS };
const yiqiladi: HujjatTekshiruvchi = {
  tekshir: async () => {
    throw new Error("AI band");
  },
};

async function tayyorla(tekshiruvchi: HujjatTekshiruvchi | null = soxta) {
  const store = new XotiraStore();
  const app = appYaratish({ store, agent: null, corsOrigin: "*", fayllar: new XotiraFaylOmbor(), tekshiruvchi });
  const s = (await (await app.request("/api/sessions", { method: "POST" })).json()) as SessiyaHolati;
  const sess = store.olish(s.id)!;
  sess.profil = { ...NAMUNALAR.tayyor, shakl: "mchj", faoliyat_oy: 24, kredit_tarixi: "yaxshi", kredit_summa: 300_000_000, kredit_muddat_oy: 36, garov_qiymati: 100_000_000 };
  store.saqlash(sess);
  return { app, store, id: s.id };
}

const yukla = (app: ReturnType<typeof appYaratish>, id: string, kalit: string, data: Buffer, nom = "a.png") => {
  const f = new FormData();
  f.set("fayl", new File([new Uint8Array(data)], nom));
  return app.request(`/api/sessions/${id}/hujjatlar/${kalit}`, { method: "POST", body: f });
};
const post = (body?: unknown) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

describe("hujjat yuklash", () => {
  it("to'g'ri PNG — 200, papkada fayl va tekshiruv", async () => {
    const { app, id } = await tayyorla();
    const r = await yukla(app, id, "ariza", PNG);
    expect(r.status).toBe(200);
    const h = (await r.json()) as SessiyaHolati;
    const x = h.papka!.hujjatlar.find((q) => q.kalit === "ariza")!;
    expect(x.fayl?.tur).toBe("image/png");
    expect(x.fayl?.tekshiruv).toEqual(MOS);
    // Ariza: tekshiruvdan o'tgan fayl tayyor; qolgan tayyorlari — Yetak qoralamalari
    const qoralamalar = h.papka!.hujjatlar.filter((q) => !q.bank_ozi_oladi && !q.tavsiya && !q.fayl && q.qoralama).length;
    expect(h.papka!.tayyor).toBe(1 + qoralamalar);
  });

  it(".txt png nomi bilan — 422", async () => {
    const { app, id } = await tayyorla();
    const r = await yukla(app, id, "ariza", Buffer.from("bu oddiy matn fayl, rasm emas"), "a.png");
    expect(r.status).toBe(422);
  });

  it("papkada yo'q kalit — 404; bank:… hujjati ham 404; sessiya yo'q — 404", async () => {
    const { app, id } = await tayyorla();
    expect((await yukla(app, id, "yoq_hujjat", PNG)).status).toBe(404);
    expect((await yukla(app, id, "bank:kredit_tarixi", PNG)).status).toBe(404);
    expect((await yukla(app, "yoq", "ariza", PNG)).status).toBe(404);
  });

  it("fayl maydoni yo'q — 400", async () => {
    const { app, id } = await tayyorla();
    const r = await app.request(`/api/sessions/${id}/hujjatlar/ariza`, { method: "POST", body: new FormData() });
    expect(r.status).toBe(400);
  });

  it("tekshiruvchi yiqilsa — fayl saqlanadi, tekshiruv null", async () => {
    const { app, id } = await tayyorla(yiqiladi);
    const r = await yukla(app, id, "ariza", PNG);
    expect(r.status).toBe(200);
    const h = (await r.json()) as SessiyaHolati;
    const x = h.papka!.hujjatlar.find((q) => q.kalit === "ariza")!;
    expect(x.fayl).not.toBeNull();
    expect(x.fayl!.tekshiruv).toBeNull();
    // Tekshirilmagan fayl qoralamani bosib ketadi — ariza tayyor sanalmaydi
    const qoralamalar = h.papka!.hujjatlar.filter((q) => !q.bank_ozi_oladi && !q.tavsiya && !q.fayl && q.qoralama).length;
    expect(h.papka!.tayyor).toBe(qoralamalar);
  });

  it("tekshiruvchi yo'q (kalit yo'q) — fayl saqlanadi", async () => {
    const { app, id } = await tayyorla(null);
    const h = (await (await yukla(app, id, "ariza", PNG)).json()) as SessiyaHolati;
    expect(h.papka!.hujjatlar.find((q) => q.kalit === "ariza")!.fayl!.tekshiruv).toBeNull();
  });

  it("ochirish: yuklangan o'chadi, yuklanmagan — 404", async () => {
    const { app, id } = await tayyorla();
    await yukla(app, id, "ariza", PNG);
    const r = await app.request(`/api/sessions/${id}/hujjatlar/ariza/ochirish`, post());
    expect(r.status).toBe(200);
    const h = (await r.json()) as SessiyaHolati;
    expect(h.papka!.hujjatlar.find((q) => q.kalit === "ariza")!.fayl).toBeNull();
    expect((await app.request(`/api/sessions/${id}/hujjatlar/ariza/ochirish`, post())).status).toBe(404);
  });
});

describe("papka.pdf", () => {
  it("fayl bor — application/pdf, %PDF bilan boshlanadi", async () => {
    const { app, id } = await tayyorla();
    await yukla(app, id, "ariza", PNG);
    const r = await app.request(`/api/sessions/${id}/papka.pdf`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toBe("application/pdf");
    expect(Buffer.from(await r.arrayBuffer()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("pulOqimi bilan — yaroqli PDF, bitta sahifa ko'proq", async () => {
    const profil = { shakl: "mchj" as const, faoliyat_oy: 24, kredit_summa: 100_000_000, kredit_muddat_oy: 36, oylik_tushum: 50_000_000, oylik_xarajat: 30_000_000 };
    const papka = papkaYasash(profil, mahsulotlarniMoslash(profil), undefined, {})!;
    const sahifa = async (po?: Parameters<typeof papkaPdf>[0]["pulOqimi"]) =>
      (await PDFDocument.load(await papkaPdf({ papka, profil, fayllar: [], sana: "2026-11-18", pulOqimi: po }))).getPageCount();
    const oddiy = await sahifa();
    const bilan = await sahifa({ oylik_tushum: 50_000_000, oylik_xarajat: 30_000_000, oylik_tolov: 4_000_000, yillik_stavka: 24, muddat_oy: 36, summa: 100_000_000 });
    expect(bilan).toBe(oddiy + 1);
  });

  it("Yetak qoralamalari (ariza, qaror) — har biri alohida sahifa; ariza bank taklifidagi to'lov bilan", async () => {
    const profil = { shakl: "mchj" as const, faoliyat: "non sexi", faoliyat_oy: 24, kredit_summa: 100_000_000, kredit_muddat_oy: 36, maqsad: "uskuna", oylik_tushum: 50_000_000, oylik_xarajat: 30_000_000, garov_qiymati: 0, kredit_tarixi: "yaxshi" as const };
    const papka = papkaYasash(profil, mahsulotlarniMoslash(profil), undefined, {})!;
    const kirish = { profil, bank: "Hamkorbank", mahsulot: "Kichik biznesga ko'mak", taklif: { foiz_min: 18, foiz_max: 24, oylik_tolov: 3_923_000 } };
    const ariza = qoralamaSahifa("ariza", kirish);
    expect(ariza.qatorlar.find(([n]) => n === "Taxminiy oylik to'lov")![1]).toContain("3 923 000");
    expect(qoralamaSahifa("ariza", { ...kirish, ism: "Aliyev Vali" }).qatorlar[0][1]).toBe("Aliyev Vali");
    const sahifa = async (q: ReturnType<typeof qoralamaSahifa>[]) =>
      (await PDFDocument.load(await papkaPdf({ papka, profil, fayllar: [], sana: "2026-11-18", qoralamalar: q }))).getPageCount();
    expect(await sahifa([ariza, qoralamaSahifa("tasischi_qarori", kirish)])).toBe((await sahifa([])) + 2);
  });

  it("fayl yo'q, lekin profil to'liq — pul oqimi qoralamasi bilan 200; sessiya yo'q — 404", async () => {
    const { app, id } = await tayyorla();
    expect((await app.request(`/api/sessions/${id}/papka.pdf`)).status).toBe(200);
    expect((await app.request(`/api/sessions/yoq/papka.pdf`)).status).toBe(404);
  });

  it("hukm hali yo'q, lekin papkada qoralama bor — PDF 200 (tugma faol bo'lsa ishlaydi)", async () => {
    const { app, store, id } = await tayyorla();
    const sess = store.olish(id)!;
    const { avval_mikrokredit: _, garov_qiymati: __, ...qisman } = sess.profil;
    sess.profil = qisman;
    store.saqlash(sess);
    const h = (await (await app.request(`/api/sessions/${id}`)).json()) as SessiyaHolati;
    expect(h.papka?.hujjatlar.some((q) => q.qoralama)).toBe(true);
    expect((await app.request(`/api/sessions/${id}/papka.pdf`)).status).toBe(200);
  });

  it("profil to'liq emas (papka yo'q) — 409", async () => {
    const store = new XotiraStore();
    const app = appYaratish({ store, agent: null, corsOrigin: "*", fayllar: new XotiraFaylOmbor(), tekshiruvchi: null });
    const s = (await (await app.request("/api/sessions", { method: "POST" })).json()) as SessiyaHolati;
    expect((await app.request(`/api/sessions/${s.id}/papka.pdf`)).status).toBe(409);
  });

  it("bank PDF — faqat bank xodimi logini bilan; eski ochiq yo'l yo'q", async () => {
    const { app, id } = await tayyorla();
    await yukla(app, id, "ariza", PNG);
    await app.request(`/api/sessions/${id}/rozilik`, post({ rozi: true }));
    expect((await app.request(`/api/bank/applications/${id}/papka.pdf`)).status).toBe(401);
    expect((await app.request(`/api/bank/arizalar/${id}/papka.pdf`)).status).toBe(404);
  });
});

describe("mahsulot almashtirish", () => {
  it("noma'lum kalit — 404", async () => {
    const { app, id } = await tayyorla();
    expect((await app.request(`/api/sessions/${id}/mahsulot`, post({ kalit: "yoq" }))).status).toBe(404);
    expect((await app.request(`/api/sessions/${id}/mahsulot`, post({}))).status).toBe(404);
  });
  it("to'g'ri kalit — papka.mahsulot o'zgaradi", async () => {
    const { app, id } = await tayyorla();
    const oldin = (await (await app.request(`/api/sessions/${id}`)).json()) as SessiyaHolati;
    const boshqa = oldin.mahsulotlar!.find((m) => m.kalit !== oldin.papka!.mahsulot.kalit)!;
    const r = await app.request(`/api/sessions/${id}/mahsulot`, post({ kalit: boshqa.kalit }));
    expect(r.status).toBe(200);
    expect(((await r.json()) as SessiyaHolati).papka!.mahsulot.kalit).toBe(boshqa.kalit);
  });
});

describe("faylTuri", () => {
  const pad = (...b: number[]) => Buffer.concat([Buffer.from(b), Buffer.alloc(16)]);
  it("PNG, JPEG, WEBP, PDF", () => {
    expect(faylTuri(PNG)).toBe("image/png");
    expect(faylTuri(pad(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(faylTuri(Buffer.from("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
    expect(faylTuri(Buffer.from("%PDF-1.7\n%....."))).toBe("application/pdf");
  });
  it("matn, qisqa va bo'sh — null", () => {
    expect(faylTuri(Buffer.from("oddiy matn fayl mazmuni"))).toBeNull();
    expect(faylTuri(Buffer.from("%PDF-"))).toBeNull();
    expect(faylTuri(Buffer.alloc(0))).toBeNull();
    expect(faylTuri(Buffer.from("RIFF\0\0\0\0WAVEfmt "))).toBeNull();
  });
});

describe("hukmChiqarish", () => {
  const xom = { hujjat_turi: "Pasport", kutilgan_hujjat: true, oqiladi: true, egasi: " Vali ", muammolar: [] as string[], izoh: " ok " };
  it("hammasi yaxshi — mos, bo'sh joylar kesiladi", () => {
    expect(hukmChiqarish(xom)).toEqual({ holat: "mos", hujjat_turi: "Pasport", egasi: "Vali", muammolar: [], izoh: "ok" });
  });
  it("kutilmagan hujjat — muammo va tayyor matn", () => {
    const r = hukmChiqarish({ ...xom, kutilgan_hujjat: false });
    expect(r.holat).toBe("muammo");
    expect(r.muammolar[0]).toContain("boshqa hujjat");
  });
  it("o'qilmasa — muammo", () => {
    const r = hukmChiqarish({ ...xom, oqiladi: false });
    expect(r.holat).toBe("muammo");
    expect(r.muammolar).toHaveLength(1);
  });
  it("AI muammo yozsa, mos emas; ko'pi 5 ta, 200 belgigacha, bo'sh tashlanadi", () => {
    const r = hukmChiqarish({ ...xom, muammolar: ["a".repeat(300), " ", "b", "c", "d", "e", "f", "g"] });
    expect(r.holat).toBe("muammo");
    expect(r.muammolar).toHaveLength(5);
    expect(r.muammolar[0]).toHaveLength(200);
  });
  it("bo'sh egasi/turi — null / Noma'lum", () => {
    const r = hukmChiqarish({ ...xom, egasi: "  ", hujjat_turi: "" });
    expect(r.egasi).toBeNull();
    expect(r.hujjat_turi).toBe("Noma'lum");
  });
});

describe("matnTozala", () => {
  it("kirill — lotin, ʻ — '", () => {
    expect(matnTozala("Алиев Вали")).toBe("Aliev Vali");
    expect(matnTozala("Қўқон ғазна")).toBe("Qo'qon g'azna");
    expect(matnTozala("Oʻzbekiston")).toBe("O'zbekiston");
  });
  it("tarjima qilib bo'lmaydigan belgi — ?, yangi qator — probel", () => {
    expect(matnTozala("a\nb")).toBe("a b");
    expect(matnTozala("日")).toBe("?");
  });
});
