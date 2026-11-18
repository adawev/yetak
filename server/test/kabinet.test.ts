import { describe, expect, it } from "vitest";
import type {
  AdminHisobot,
  BankArizasiHolat,
  BankHisobi,
  HamkorBank,
  KirishJavobi,
  MenJavobi,
  SessiyaHolati,
} from "../../shared/types";
import type { Agent } from "../src/agent";
import { appYaratish } from "../src/app";
import { Hisoblar, telefonTozala } from "../src/hisoblar";
import { NAMUNALAR } from "../src/namunalar";
import { XotiraStore } from "../src/store";

const agent: Agent = {
  async javob(k) {
    return { matn: "ok", tugmalar: [], profil: { ...k.profil, ...NAMUNALAR.tayyor } };
  },
};

const post = (body?: unknown, token?: string) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: body === undefined ? undefined : JSON.stringify(body),
});
const get = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

function muhit() {
  const hisoblar = new Hisoblar();
  hisoblar.adminTayyorla("90 000 00 01", "admin123");
  const app = appYaratish({ store: new XotiraStore(), agent, corsOrigin: "*", hisoblar });
  return { app, hisoblar };
}

async function kir(app: ReturnType<typeof appYaratish>, telefon: string, parol: string) {
  const r = await app.request("/api/auth/login", post({ telefon, parol }));
  return (await r.json()) as KirishJavobi;
}

describe("telefonTozala", () => {
  it("9 xonali va to'liq raqamni qabul qiladi", () => {
    expect(telefonTozala("90 123 45 67")).toBe("998901234567");
    expect(telefonTozala("+998 (90) 123-45-67")).toBe("998901234567");
    expect(telefonTozala("12345")).toBeNull();
  });
});

describe("Kabinetlar", () => {
  it("ro'yxat → suhbat kabinetga biriktiriladi; parol xato bo'lsa 401; takror raqam 409", async () => {
    const { app } = muhit();
    const s = (await (await app.request("/api/sessions", post())).json()) as SessiyaHolati;
    const r = await app.request(
      "/api/auth/register",
      post({ ism: "Ali", telefon: "901234567", parol: "maxfiy1", sessiya_id: s.id }),
    );
    expect(r.status).toBe(201);
    const { token, foydalanuvchi } = (await r.json()) as KirishJavobi;
    expect(foydalanuvchi.rol).toBe("tadbirkor");
    expect(JSON.stringify(foydalanuvchi)).not.toContain("maxfiy1");

    const men = (await (await app.request("/api/auth/me", get(token))).json()) as MenJavobi;
    expect(men.suhbatlar.map((x) => x.id)).toEqual([s.id]);

    // Bitta suhbat: boshqa qurilmada ochilgan yangi suhbat biriktirilmaydi, eskisi qoladi
    const s2 = (await (await app.request("/api/sessions", post())).json()) as SessiyaHolati;
    const men2 = (await (await app.request("/api/auth/attach", post({ sessiya_id: s2.id }, token))).json()) as MenJavobi;
    expect(men2.suhbatlar.map((x) => x.id)).toEqual([s.id]);

    expect((await app.request("/api/auth/login", post({ telefon: "901234567", parol: "boshqa1" }))).status).toBe(401);
    expect((await app.request("/api/auth/register", post({ ism: "B", telefon: "901234567", parol: "maxfiy1" }))).status).toBe(409);

    await app.request("/api/auth/logout", post(undefined, token));
    expect((await app.request("/api/auth/me", get(token))).status).toBe(401);
  });

  it("tadbirkor admin va bank yo'llariga kira olmaydi", async () => {
    const { app } = muhit();
    const r = await app.request("/api/auth/register", post({ ism: "Ali", telefon: "901234567", parol: "maxfiy1" }));
    const { token } = (await r.json()) as KirishJavobi;
    expect((await app.request("/api/admin/report", get(token))).status).toBe(403);
    expect((await app.request("/api/bank/applications", get(token))).status).toBe(403);
  });

  it("admin bank ochadi → xodim qaror qiladi → komissiya va hisobot", async () => {
    const { app } = muhit();
    const admin = await kir(app, "900000001", "admin123");
    expect(admin.foydalanuvchi.rol).toBe("admin");

    // Shartnoma muzokarada — bank arizalarni ko'rmaydi
    const b = (await (
      await app.request("/api/admin/banks", post({ nom: "Bank A", shartnoma: "muzokarada", komissiya_foiz: 1.5 }, admin.token))
    ).json()) as HamkorBank;
    expect((await app.request("/api/admin/banks", post({ nom: "", shartnoma: "faol", komissiya_foiz: 1 }, admin.token))).status).toBe(400);
    await app.request(`/api/admin/banks/${b.id}/staff`, post({ ism: "Xodim", telefon: "901112233", parol: "bank123" }, admin.token));
    const xodim = await kir(app, "901112233", "bank123");
    expect(xodim.foydalanuvchi.bank_id).toBe(b.id);
    expect((await app.request("/api/bank/applications", get(xodim.token))).status).toBe(403);

    await app.request(`/api/admin/banks/${b.id}`, post({ shartnoma: "faol" }, admin.token));

    // Tadbirkor suhbatni tugatib rozilik beradi
    const s = (await (await app.request("/api/sessions", post())).json()) as SessiyaHolati;
    await app.request(`/api/sessions/${s.id}/messages`, post({ matn: "salom" }));
    await app.request(`/api/sessions/${s.id}/rozilik`, post({ rozi: true }));

    const royxat = (await (await app.request("/api/bank/applications", get(xodim.token))).json()) as BankArizasiHolat[];
    expect(royxat).toHaveLength(1);
    expect(royxat[0].qaror.holat).toBe("yangi");

    const qaror = (yol: unknown) => app.request(`/api/bank/applications/${s.id}/decision`, post(yol, xodim.token));
    expect((await qaror({ holat: "rad" })).status).toBe(400); // sababsiz
    expect((await qaror({ holat: "berildi" })).status).toBe(400); // summasiz
    const berildi = (await (await qaror({ holat: "berildi", summa: 100_000_000 })).json()) as BankArizasiHolat;
    expect(berildi.qaror.komissiya).toBe(1_500_000);

    const hisob = (await (await app.request("/api/bank/stats", get(xodim.token))).json()) as BankHisobi;
    expect(hisob.holatlar.berildi).toBe(1);
    expect(hisob.komissiya).toBe(1_500_000);

    const h = (await (await app.request("/api/admin/report", get(admin.token))).json()) as AdminHisobot;
    expect(h.foydalanuvchilar).toEqual({ tadbirkor: 0, bank: 1, admin: 1 });
    expect(h.suhbatlar).toMatchObject({ jami: 1, tugallangan: 1, rozilik: 1 });
    expect(h.jami).toEqual({ berilgan_kredit: 1, berilgan_summa: 100_000_000, daromad: 1_500_000 });
    expect(h.kunlik).toHaveLength(7);
    expect(h.kunlik[6].soni).toBe(1);
  });
});
