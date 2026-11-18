import { describe, expect, it } from "vitest";
import type { SessiyaHolati } from "../../shared/types";
import { AgentXatosi, type Agent } from "../src/agent";
import { appYaratish } from "../src/app";
import { Hisoblar } from "../src/hisoblar";
import { NAMUNALAR } from "../src/namunalar";
import { XotiraStore } from "../src/store";

// Soxta agent: har xabarda profilni bitta namunadan to'ldiradi.
const soxtaAgent: Agent = {
  async javob(k) {
    const oxirgi = k.xabarlar[k.xabarlar.length - 1].matn;
    if (oxirgi === "xato") throw new AgentXatosi("Agent hozir juda band.", 503);
    return { matn: "Tushundim.", tugmalar: ["Ha"], profil: { ...k.profil, ...NAMUNALAR.tayyor } };
  },
};

function yangiApp(agent: Agent | null = soxtaAgent) {
  return appYaratish({ store: new XotiraStore(), agent, corsOrigin: "*" });
}

const post = (body?: unknown) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

describe("API", () => {
  it("health", async () => {
    const r = await yangiApp().request("/api/health");
    expect(await r.json()).toEqual({ ok: true, agent: true });
  });

  it("to'liq yo'l: sessiya → xabar → qadam → rozilik → bank", async () => {
    // Faol shartnomali bank va uning xodimi
    const hisoblar = new Hisoblar();
    const bank = hisoblar.bankYarat({ nom: "Bank", shartnoma: "faol", komissiya_foiz: 1 });
    const xodim = hisoblar.yarat({ ism: "X", telefon: "998901112233", parol: "parol123", rol: "bank", bank_id: bank.id })!;
    const auth = { headers: { Authorization: `Bearer ${hisoblar.tokenBer(xodim.id)}` } };
    const app = appYaratish({ store: new XotiraStore(), agent: soxtaAgent, corsOrigin: "*", hisoblar });
    expect((await app.request("/api/bank/applications")).status).toBe(401);

    const s = (await (await app.request("/api/sessions", post())).json()) as SessiyaHolati;
    expect(s.xabarlar[0].kim).toBe("agent");
    expect(s.natija).toBeNull();
    expect(s.jarayon).toEqual({ toldirilgan: 0, jami: 11 });

    // Rozilik natijasiz — rad
    expect((await app.request(`/api/sessions/${s.id}/rozilik`, post({ rozi: true }))).status).toBe(422);

    const r = await app.request(`/api/sessions/${s.id}/messages`, post({ matn: "salom" }));
    const h = (await r.json()) as SessiyaHolati;
    expect(h.xabarlar).toHaveLength(3);
    expect(h.natija?.hukm).toBe("tayyor");
    expect(h.tugmalar).toEqual(["Ha"]);

    // Bank rozilikgacha hech narsa ko'rmaydi
    expect(await (await app.request("/api/bank/applications", auth)).json()).toEqual([]);
    expect((await app.request(`/api/bank/applications/${s.id}`, auth)).status).toBe(404);

    const q = await app.request(`/api/sessions/${s.id}/qadamlar/ariza`, post({ bajarildi: true }));
    expect(((await q.json()) as SessiyaHolati).natija?.qadamlar.find((x) => x.kalit === "ariza")?.bajarildi).toBe(true);
    expect((await app.request(`/api/sessions/${s.id}/qadamlar/yoq`, post({ bajarildi: true }))).status).toBe(404);

    await app.request(`/api/sessions/${s.id}/rozilik`, post({ rozi: true }));
    const royxat = (await (await app.request("/api/bank/applications", auth)).json()) as unknown[];
    expect(royxat).toHaveLength(1);
    expect((await app.request(`/api/bank/applications/${s.id}`, auth)).status).toBe(200);

    // Rozilikni qaytarib olsa — bank ko'rmaydi
    await app.request(`/api/sessions/${s.id}/rozilik`, post({ rozi: false }));
    expect(await (await app.request("/api/bank/applications", auth)).json()).toEqual([]);
  });

  it("xato holatlari haqiqiy sababni aytadi", async () => {
    const app = yangiApp();
    expect((await app.request("/api/sessions/yoq")).status).toBe(404);
    const s = (await (await app.request("/api/sessions", post())).json()) as SessiyaHolati;
    const bosh = await app.request(`/api/sessions/${s.id}/messages`, post({ matn: "  " }));
    expect(bosh.status).toBe(400);
    expect(((await bosh.json()) as { xato: string }).xato).toContain("bo'sh");
    const notoJson = await app.request(`/api/sessions/${s.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    expect(notoJson.status).toBe(400);
    expect((await app.request(`/api/sessions/${s.id}/messages`, post({ matn: "x".repeat(2001) }))).status).toBe(413);

    const band = await app.request(`/api/sessions/${s.id}/messages`, post({ matn: "xato" }));
    expect(band.status).toBe(503);
    // Agent xatosida tadbirkor xabari saqlanmaydi — qayta yuborsa bo'ladi
    const h = (await (await app.request(`/api/sessions/${s.id}`)).json()) as SessiyaHolati;
    expect(h.xabarlar).toHaveLength(1);
  });

  it("kalit yo'q bo'lsa 503 va sababi", async () => {
    const app = yangiApp(null);
    const s = (await (await app.request("/api/sessions", post())).json()) as SessiyaHolati;
    const r = await app.request(`/api/sessions/${s.id}/messages`, post({ matn: "salom" }));
    expect(r.status).toBe(503);
    expect(((await r.json()) as { xato: string }).xato).toContain("kaliti");
  });

  it("bir sessiyaga bir vaqtda ikki xabar — ikkinchisi 409", async () => {
    let qoyibYubor = () => {};
    const sekin: Agent = {
      javob: (k) =>
        new Promise((res) => {
          qoyibYubor = () => res({ matn: "ok", tugmalar: [], profil: k.profil });
        }),
    };
    const app = yangiApp(sekin);
    const s = (await (await app.request("/api/sessions", post())).json()) as SessiyaHolati;
    const birinchi = app.request(`/api/sessions/${s.id}/messages`, post({ matn: "1" }));
    await new Promise((r) => setTimeout(r, 10));
    expect((await app.request(`/api/sessions/${s.id}/messages`, post({ matn: "2" }))).status).toBe(409);
    qoyibYubor();
    expect((await birinchi).status).toBe(200);
  });
});
