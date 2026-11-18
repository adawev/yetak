// API yo'llari. Shakli: docs/ARXITEKTURA.md.

import { randomUUID } from "node:crypto";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import type { Papka, SessiyaHolati, XatoJavobi, YuklanganFayl } from "../../shared/types";
import { AgentXatosi, SALOM, type Agent } from "./agent";
import { Hisoblar } from "./hisoblar";
import { papkadaBormi, papkaYasash } from "./hujjatlar";
import { kabinetYollari } from "./kabinet";
import { mahsulotlarniMoslash } from "./mahsulotlar";
import { papkaPdf } from "./papka-pdf";
import { natijaHisobla } from "./natija";
import { kerakliMaydonlar, toldirilganSoni } from "./rules";
import { XotiraFaylOmbor, type FaylOmbor, type Sessiya, type Store } from "./store";
import { RUXSAT_TURLAR, type HujjatTekshiruvchi, type RuxsatTur } from "./tekshiruv";

export interface AppSozlama {
  store: Store;
  agent: Agent | null; // null — kalit yo'q
  corsOrigin: string;
  fayllar?: FaylOmbor;
  tekshiruvchi?: HujjatTekshiruvchi | null; // null — kalit yo'q: fayl saqlanadi, tekshirilmaydi
  /** Login, banklar, qarorlar. Berilmasa — xotirada. */
  hisoblar?: Hisoblar;
}

const MAX_MATN = 2000;
const MAX_XABAR = 300;
const MAX_FAYL = 10 * 1024 * 1024;

export function sessiyaPapkasi(s: Sessiya): Papka | null {
  return papkaYasash(s.profil, mahsulotlarniMoslash(s.profil), s.mahsulot, s.fayllar ?? {});
}

function holat(s: Sessiya): SessiyaHolati {
  return {
    id: s.id,
    xabarlar: s.xabarlar,
    profil: s.profil,
    natija: natijaHisobla(s.profil, s.bajarilgan),
    tugmalar: s.tugmalar,
    jarayon: { toldirilgan: toldirilganSoni(s.profil), jami: kerakliMaydonlar(s.profil).length },
    bank_roziligi: s.bank_roziligi,
    mahsulotlar: mahsulotlarniMoslash(s.profil),
    papka: sessiyaPapkasi(s),
  };
}

/** Fayl boshidagi baytlardan haqiqiy turini aniqlaydi (brauzer aytgan turga ishonmaymiz). */
export function faylTuri(b: Buffer): RuxsatTur | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  if (b.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  return null;
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

export function appYaratish({
  store,
  agent,
  corsOrigin,
  fayllar = new XotiraFaylOmbor(),
  tekshiruvchi = null,
  hisoblar = new Hisoblar(),
}: AppSozlama) {
  const app = new Hono();
  const band = new Set<string>(); // javob kutilayotgan sessiyalar
  const xabarChegara = chegara(20);
  const sessiyaChegara = chegara(10);
  const kirishChegara = chegara(10);
  const ip = (c: Context) =>
    c.req.header("x-real-ip") ?? c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "lokal";

  app.use(
    "/api/*",
    cors({
      origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((s) => s.trim()),
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
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

  /** Tadbirkor xabari (ixtiyoriy skrinshot bilan) → agent javobi. Rasm saqlanmaydi, faqat shu so'rovda o'qiladi. */
  const xabarYuborish = async (
    c: Context,
    s: Sessiya,
    matn: string,
    rasm?: { tur: Exclude<RuxsatTur, "application/pdf">; data: Buffer },
  ) => {
    if (!matn) return xato(c, 400, "Xabar bo'sh. Biror narsa yozing.");
    if (matn.length > MAX_MATN) return xato(c, 413, `Xabar juda uzun. ${MAX_MATN} belgidan qisqa yozing.`);
    if (s.xabarlar.length >= MAX_XABAR) return xato(c, 409, "Suhbat juda uzun bo'lib ketdi. Yangi suhbat boshlang.");
    if (!agent) return xato(c, 503, "Server sozlanmagan: sun'iy intellekt kaliti yo'q. Jamoaga xabar bering.");
    if (!xabarChegara(ip(c))) return xato(c, 429, "Juda tez yozyapsiz. Bir daqiqadan keyin qayta yuboring.");
    if (band.has(s.id)) return xato(c, 409, "Agent oldingi xabaringizga javob tayyorlayapti. Biroz kuting.");

    band.add(s.id);
    try {
      const yangiXabar = {
        kim: "tadbirkor" as const,
        matn,
        vaqt: new Date().toISOString(),
        ...(rasm ? { rasm: true } : {}),
      };
      const j = await agent.javob({
        xabarlar: [...s.xabarlar, yangiXabar],
        profil: s.profil,
        bajarilgan: s.bajarilgan,
        mahsulot: s.mahsulot,
        fayllar: s.fayllar,
        ...(rasm ? { rasm: { tur: rasm.tur, data: rasm.data.toString("base64") } } : {}),
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
      if (j.mahsulot) s.mahsulot = j.mahsulot;
      store.saqlash(s);
      return c.json(holat(s));
    } catch (e) {
      if (e instanceof AgentXatosi) return xato(c, e.status, e.foydalanuvchiga);
      console.error("xabar xatosi:", (e as Error)?.message);
      return xato(c, 500, "Serverda kutilmagan xato. Xabaringizni qayta yuboring.");
    } finally {
      band.delete(s.id);
    }
  };

  app.post("/api/sessions/:id/messages", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const body = await jsonOqish(c);
    const matn = typeof body?.matn === "string" ? body.matn.trim() : "";
    return xabarYuborish(c, s, matn);
  });

  // Skrinshot bilan xabar. Yo'l /hujjatlar/ ostida — nginx shu yo'lga katta fayl ruxsat bergan.
  app.post("/api/sessions/:id/hujjatlar/skrinshot", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    if (Number(c.req.header("content-length") ?? 0) > MAX_FAYL + 64 * 1024) {
      return xato(c, 413, "Rasm juda katta. 10 MB dan kichik rasm yuboring.");
    }
    let forma: Record<string, unknown>;
    try {
      forma = await c.req.parseBody();
    } catch {
      return xato(c, 400, "Rasm yetib kelmadi. Qayta yuboring.");
    }
    const fayl = forma.rasm instanceof File ? forma.rasm : null;
    if (!fayl || fayl.size === 0) return xato(c, 400, "Rasm tanlanmagan yoki bo'sh.");
    if (fayl.size > MAX_FAYL) return xato(c, 413, "Rasm juda katta. 10 MB dan kichik rasm yuboring.");
    const data = Buffer.from(await fayl.arrayBuffer());
    const tur = faylTuri(data);
    if (!tur || tur === "application/pdf") return xato(c, 422, "Bu yerga faqat rasm (skrinshot) yuboring: JPG yoki PNG.");
    const matn = (typeof forma.matn === "string" ? forma.matn.trim() : "") || "(rasm)";
    return xabarYuborish(c, s, matn, { tur, data });
  });

  app.post("/api/sessions/:id/qadamlar/:kalit", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const body = await jsonOqish(c);
    if (typeof body?.bajarildi !== "boolean") return xato(c, 400, "«bajarildi» true yoki false bo'lishi kerak.");
    const natija = natijaHisobla(s.profil, s.bajarilgan);
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
    if (body.rozi && !natijaHisobla(s.profil, s.bajarilgan)) {
      return xato(c, 422, "Avval savollarga javob berib, tekshiruvni yakunlang. Keyin bankka ko'rsatish mumkin.");
    }
    s.bank_roziligi = body.rozi;
    store.saqlash(s);
    return c.json(holat(s));
  });

  // --- Hujjatlar papkasi ---

  app.post("/api/sessions/:id/mahsulot", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const body = await jsonOqish(c);
    const kalit = typeof body?.kalit === "string" ? body.kalit : "";
    if (!mahsulotlarniMoslash(s.profil).some((m) => m.kalit === kalit)) {
      return xato(c, 404, "Bunday bank mahsuloti ro'yxatda yo'q.");
    }
    s.mahsulot = kalit;
    store.saqlash(s);
    return c.json(holat(s));
  });

  const tekshirilmoqda = new Set<string>();
  const yuklashChegara = chegara(15);

  app.post("/api/sessions/:id/hujjatlar/:kalit", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const kalit = c.req.param("kalit");
    const papka = sessiyaPapkasi(s);
    if (!papkadaBormi(papka, kalit)) return xato(c, 404, "Bu hujjat tanlangan bank ro'yxatida yo'q.");
    if (Number(c.req.header("content-length") ?? 0) > MAX_FAYL + 64 * 1024) {
      return xato(c, 413, "Fayl juda katta. 10 MB dan kichik fayl yuklang.");
    }
    if (!yuklashChegara(ip(c))) return xato(c, 429, "Juda ko'p fayl yuklandi. Bir daqiqadan keyin urinib ko'ring.");
    const qulf = `${s.id}/${kalit}`;
    if (tekshirilmoqda.has(qulf)) return xato(c, 409, "Bu hujjat hozir tekshirilyapti. Biroz kuting.");

    let fayl: File | null = null;
    try {
      const forma = await c.req.parseBody();
      fayl = forma.fayl instanceof File ? forma.fayl : null;
    } catch {
      return xato(c, 400, "Fayl yetib kelmadi. Qayta yuklang.");
    }
    if (!fayl || fayl.size === 0) return xato(c, 400, "Fayl tanlanmagan yoki bo'sh.");
    if (fayl.size > MAX_FAYL) return xato(c, 413, "Fayl juda katta. 10 MB dan kichik fayl yuklang.");
    const data = Buffer.from(await fayl.arrayBuffer());
    const tur = faylTuri(data);
    if (!tur) return xato(c, 422, "Bu fayl turi qabul qilinmaydi. Rasm (JPG, PNG) yoki PDF yuklang.");

    const hujjat = papka!.hujjatlar.find((h) => h.kalit === kalit)!;
    tekshirilmoqda.add(qulf);
    try {
      fayllar.yoz(s.id, kalit, data);
      let tekshiruv: YuklanganFayl["tekshiruv"] = null;
      if (tekshiruvchi) {
        try {
          tekshiruv = await tekshiruvchi.tekshir({
            fayl: data,
            tur,
            kutilgan: hujjat.nom,
            bugun: new Date().toISOString().slice(0, 10),
          });
        } catch (e) {
          // Tekshiruv bo'lmasa ham fayl saqlanadi va papkaga kiradi.
          console.error("hujjat tekshiruvi xatosi:", (e as Error)?.message);
        }
      }
      s.fayllar = {
        ...(s.fayllar ?? {}),
        [kalit]: {
          nom: (fayl.name || hujjat.nom).replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 80),
          tur,
          hajm: data.length,
          vaqt: new Date().toISOString(),
          tekshiruv,
        },
      };
      store.saqlash(s);
      return c.json(holat(s));
    } finally {
      tekshirilmoqda.delete(qulf);
    }
  });

  app.post("/api/sessions/:id/hujjatlar/:kalit/ochirish", (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    const kalit = c.req.param("kalit");
    if (!s.fayllar?.[kalit]) return xato(c, 404, "Bu hujjat yuklanmagan.");
    try {
      fayllar.ochir(s.id, kalit);
    } catch {
      return xato(c, 400, "Noto'g'ri hujjat kaliti.");
    }
    const { [kalit]: _, ...qolgan } = s.fayllar;
    s.fayllar = qolgan;
    store.saqlash(s);
    return c.json(holat(s));
  });

  const pdfJavob = async (c: Context, s: Sessiya) => {
    const papka = sessiyaPapkasi(s);
    if (!papka) return xato(c, 409, "Avval suhbatda ish turi va kerakli summani ayting — keyin papka tuziladi.");
    const ruyxat = papka.hujjatlar
      .filter((h) => h.fayl)
      .flatMap((h) => {
        const data = fayllar.oqi(s.id, h.kalit);
        return data ? [{ kalit: h.kalit, nom: h.nom, tur: h.fayl!.tur, data }] : [];
      });
    // Pul oqimi qoralamasi: raqamlarni kod hisoblaydi (natija.hisob), AI emas.
    const n = natijaHisobla(s.profil, s.bajarilgan);
    const p = s.profil;
    const pulOqimi =
      n && p.oylik_tushum != null && p.oylik_xarajat != null && p.kredit_summa != null && p.kredit_muddat_oy != null
        ? {
            oylik_tushum: p.oylik_tushum,
            oylik_xarajat: p.oylik_xarajat,
            oylik_tolov: n.hisob.oylik_tolov,
            yillik_stavka: n.hisob.yillik_stavka,
            muddat_oy: p.kredit_muddat_oy,
            summa: p.kredit_summa,
          }
        : undefined;
    if (!ruyxat.length && !pulOqimi) return xato(c, 409, "Hali hech qanday hujjat yuklanmagan.");
    const pdf = await papkaPdf({
      papka,
      profil: s.profil,
      fayllar: ruyxat,
      sana: new Date().toISOString().slice(0, 10),
      pulOqimi,
    });
    return new Response(new Blob([pdf as BlobPart]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="yetak-papka-${new Date().toISOString().slice(0, 10)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  };

  app.get("/api/sessions/:id/papka.pdf", async (c) => {
    const s = store.olish(c.req.param("id"));
    if (!s) return xato(c, 404, "Suhbat topilmadi. Yangi suhbat boshlang.");
    return pdfJavob(c, s);
  });

  // Login, tadbirkor kabineti, bank oynasi (login bilan), admin panel. Bank papka PDF ini ham shu yerda (login bilan).
  kabinetYollari(app, { store, hisoblar, chegara: kirishChegara, ip, papka: sessiyaPapkasi, pdf: pdfJavob });

  app.notFound((c) => xato(c, 404, "Bunday manzil yo'q."));
  app.onError((e, c) => {
    console.error("server xatosi:", e.message);
    return xato(c, 500, "Serverda kutilmagan xato. Qayta urinib ko'ring.");
  });

  return app;
}
