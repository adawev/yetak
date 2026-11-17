// API yo'llari. Shakli: docs/ARXITEKTURA.md.

import { randomUUID } from "node:crypto";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import type { BankArizasi, SessiyaHolati, XatoJavobi } from "../../shared/types";
import { AgentXatosi, SALOM, type Agent } from "./agent";
import { baholash, MAJBURIY_MAYDONLAR, toldirilganSoni } from "./rules";
import type { Sessiya, Store } from "./store";

export interface AppSozlama {
  store: Store;
  agent: Agent | null; // null — kalit yo'q
  corsOrigin: string;
}

const MAX_MATN = 2000;
const MAX_XABAR = 300;

function holat(s: Sessiya): SessiyaHolati {
  return {
    id: s.id,
    xabarlar: s.xabarlar,
    profil: s.profil,
    natija: baholash(s.profil, s.bajarilgan),
    tugmalar: s.tugmalar,
    jarayon: { toldirilgan: toldirilganSoni(s.profil), jami: MAJBURIY_MAYDONLAR.length },
    bank_roziligi: s.bank_roziligi,
  };
}

const xato = (c: Context, status: 400 | 404 | 409 | 413 | 422 | 429 | 500 | 502 | 503 | 504, sabab: string) =>
  c.json<XatoJavobi>({ xato: sabab }, status);

/** Oddiy chegara: bitta IP dan daqiqasiga N ta so'rov. Claude xarajatini himoya qiladi. */
function chegara(limit: number) {
  const hisob = new Map<string, { n: number; boshi: number }>();
  return (ip: string) => {
    const hozir = Date.now();
    const h = hisob.get(ip);
    if (!h || hozir - h.boshi > 60_000) {
      hisob.set(ip, { n: 1, boshi: hozir });
      if (hisob.size > 10_000) hisob.clear();
      return true;
    }
    h.n++;
    return h.n <= limit;
  };
}

async function jsonOqish(c: Context): Promise<Record<string, unknown> | null> {
  try {
    const b = await c.req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function appYaratish({ store, agent, corsOrigin }: AppSozlama) {
  const app = new Hono();
  const band = new Set<string>(); // javob kutilayotgan sessiyalar
  const xabarChegara = chegara(20);
  const sessiyaChegara = chegara(10);
  const ip = (c: Context) =>
    c.req.header("x-real-ip") ?? c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "lokal";

  app.use(
    "/api/*",
    cors({
      origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((s) => s.trim()),
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  // Log: faqat usul, yo'l shakli, holat, vaqt. Shaxsiy ma'lumot yozilmaydi.
  app.use("/api/*", async (c, next) => {
    const boshi = Date.now();
    await next();
    const yol = c.req.path.replace(/[0-9a-f-]{36}/g, ":id");
    console.log(`${c.req.method} ${yol} ${c.res.status} ${Date.now() - boshi}ms`);
  });

  app.get("/api/health", (c) => c.json({ ok: true, agent: agent !== null }));

  app.post("/api/sessions", (c) => {
    if (!sessiyaChegara(ip(c))) return xato(c, 429, "Juda ko'p yangi suhbat ochildi. Bir daqiqadan keyin urinib ko'ring.");
    const hozir = new Date().toISOString();
    const s: Sessiya = {
      id: randomUUID(),
      yaratilgan: hozir,
      yangilangan: hozir,
      xabarlar: [{ kim: "agent", matn: SALOM.matn, vaqt: hozir }],
      profil: {},
      tugmalar: SALOM.tugmalar,
      bajarilgan: [],
      bank_roziligi: false,
    };
    store.saqlash(s);
    return c.json(holat(s), 201);
  });

  app.get("/api/sessions/:id", (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    return c.json(holat(s));
  });

  app.post("/api/sessions/:id/messages", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const body = await jsonOqish(c);
    const matn = typeof body?.matn === "string" ? body.matn.trim() : "";
    if (!matn) return xato(c, 400, "Xabar bo'sh. Biror narsa yozing.");
    if (matn.length > MAX_MATN) return xato(c, 413, `Xabar juda uzun. ${MAX_MATN} belgidan qisqa yozing.`);
    if (s.xabarlar.length >= MAX_XABAR) return xato(c, 409, "Suhbat juda uzun bo'lib ketdi. Yangi suhbat boshlang.");
    if (!agent) return xato(c, 503, "Server sozlanmagan: sun'iy intellekt kaliti yo'q. Jamoaga xabar bering.");
    if (!xabarChegara(ip(c))) return xato(c, 429, "Juda tez yozyapsiz. Bir daqiqadan keyin qayta yuboring.");
    if (band.has(s.id)) return xato(c, 409, "Agent oldingi xabaringizga javob tayyorlayapti. Biroz kuting.");

    band.add(s.id);
    try {
      const yangiXabar = { kim: "tadbirkor" as const, matn, vaqt: new Date().toISOString() };
      const j = await agent.javob({
        xabarlar: [...s.xabarlar, yangiXabar],
        profil: s.profil,
        bajarilgan: s.bajarilgan,
      });
      s.xabarlar.push(yangiXabar, {
        kim: "agent",
        matn: j.matn,
        vaqt: new Date().toISOString(),
        ...(j.bloklar?.length ? { bloklar: j.bloklar } : {}),
        ...(j.manbalar?.length ? { manbalar: j.manbalar } : {}),
      });
      s.profil = j.profil;
      s.tugmalar = j.tugmalar;
      store.saqlash(s);
      return c.json(holat(s));
    } catch (e) {
      if (e instanceof AgentXatosi) return xato(c, e.status, e.foydalanuvchiga);
      console.error("xabar xatosi:", (e as Error)?.message);
      return xato(c, 500, "Serverda kutilmagan xato. Xabaringizni qayta yuboring.");
    } finally {
      band.delete(s.id);
    }
  });

  app.post("/api/sessions/:id/qadamlar/:kalit", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const body = await jsonOqish(c);
    if (typeof body?.bajarildi !== "boolean") return xato(c, 400, "«bajarildi» true yoki false bo'lishi kerak.");
    const natija = baholash(s.profil, s.bajarilgan);
    const kalit = c.req.param("kalit");
    if (!natija?.qadamlar.some((q) => q.kalit === kalit)) {
      return xato(c, 404, "Bunday qadam yo'l xaritasida yo'q.");
    }
    const toplam = new Set(s.bajarilgan);
    if (body.bajarildi) toplam.add(kalit);
    else toplam.delete(kalit);
    s.bajarilgan = [...toplam];
    store.saqlash(s);
    return c.json(holat(s));
  });

  app.post("/api/sessions/:id/rozilik", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const body = await jsonOqish(c);
    if (typeof body?.rozi !== "boolean") return xato(c, 400, "«rozi» true yoki false bo'lishi kerak.");
    if (body.rozi && !baholash(s.profil, s.bajarilgan)) {
      return xato(c, 422, "Avval savollarga javob berib, tekshiruvni yakunlang. Keyin bankka ko'rsatish mumkin.");
    }
    s.bank_roziligi = body.rozi;
    store.saqlash(s);
    return c.json(holat(s));
  });

  const bankArizasi = (s: Sessiya): BankArizasi | null => {
    const natija = baholash(s.profil, s.bajarilgan);
    if (!s.bank_roziligi || !natija) return null;
    return { id: s.id, yangilangan: s.yangilangan, profil: s.profil, natija };
  };

  app.get("/api/bank/arizalar", (c) => {
    const royxat = store
      .hammasi()
      .map(bankArizasi)
      .filter((a): a is BankArizasi => a !== null)
      .sort((a, b) => b.yangilangan.localeCompare(a.yangilangan));
    return c.json(royxat);
  });

  app.get("/api/bank/arizalar/:id", (c) => {
    const s = store.olish(c.req.param("id"));
    const a = s ? bankArizasi(s) : null;
    if (!a) return xato(c, 404, "Ariza topilmadi yoki tadbirkor rozilikni qaytarib oldi.");
    return c.json(a);
  });

  app.notFound((c) => xato(c, 404, "Bunday manzil yo'q."));
  app.onError((e, c) => {
    console.error("server xatosi:", e.message);
    return xato(c, 500, "Serverda kutilmagan xato. Qayta urinib ko'ring.");
  });

  return app;
}
