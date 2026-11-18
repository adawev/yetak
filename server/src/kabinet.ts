// Kabinetlar API: login, tadbirkor kabineti, bank oynasi, admin panel.
// Biznes modeli: tadbirkor uchun bepul. Hamkor bank faqat berilgan kredit uchun komissiya to'laydi.
// Komissiyani kod hisoblaydi: summa × bank.komissiya_foiz / 100.

import type { Context, Hono } from "hono";
import type {
  AdminHisobot,
  ArizaHolati,
  ArizaQarori,
  BankArizasiHolat,
  BankHisobi,
  Foydalanuvchi,
  HamkorBank,
  Hukm,
  KirishJavobi,
  MenJavobi,
  Rol,
  Shartnoma,
  XatoJavobi,
} from "../../shared/types";
import { type Hisoblar, telefonTozala } from "./hisoblar";
import { baholash } from "./rules";
import type { Sessiya, Store } from "./store";

type Status = 400 | 401 | 403 | 404 | 409 | 422 | 429;
const xato = (c: Context, status: Status, sabab: string) => c.json<XatoJavobi>({ xato: sabab }, status);

const HOLATLAR: ArizaHolati[] = ["yangi", "korilmoqda", "berildi", "rad"];
const SHARTNOMALAR: Shartnoma[] = ["faol", "muzokarada", "toxtatilgan"];
const MAX_SUMMA = 100_000_000_000; // 100 mlrd — xato kiritishdan himoya

const bosh = (): Record<ArizaHolati, number> => ({ yangi: 0, korilmoqda: 0, berildi: 0, rad: 0 });
export const komissiyaHisobla = (summa: number, foiz: number) => Math.round((summa * foiz) / 100);

async function json(c: Context): Promise<Record<string, unknown>> {
  try {
    const b = await c.req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
const matn = (v: unknown, max = 100) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function kabinetYollari(
  app: Hono,
  { store, hisoblar, chegara, ip }: {
    store: Store;
    hisoblar: Hisoblar;
    chegara: (ip: string) => boolean;
    ip: (c: Context) => string;
  },
) {
  const token = (c: Context) => c.req.header("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

  /** Kirgan foydalanuvchi va rolini tekshiradi. Xato bo'lsa Response qaytaradi. */
  const talab = (c: Context, ...rollar: Rol[]): Foydalanuvchi | Response => {
    const f = token(c) ? hisoblar.tokenEgasi(token(c)) : null;
    if (!f) return xato(c, 401, "Avval tizimga kiring.");
    if (rollar.length && !rollar.includes(f.rol)) return xato(c, 403, "Bu sahifa sizning rolingiz uchun emas.");
    return f;
  };

  const biriktir = (f: Foydalanuvchi, sessiyaId: unknown) => {
    if (f.rol === "tadbirkor" && typeof sessiyaId === "string" && store.olish(sessiyaId)) {
      hisoblar.sessiyaBiriktir(f.id, sessiyaId);
    }
  };

  const men = (f: Foydalanuvchi): MenJavobi => ({
    foydalanuvchi: f,
    suhbatlar:
      f.rol !== "tadbirkor"
        ? []
        : hisoblar
            .sessiyalari(f.id)
            .map((id) => store.olish(id))
            .filter((s): s is Sessiya => s !== undefined)
            .map((s) => ({
              id: s.id,
              yangilangan: s.yangilangan,
              faoliyat: s.profil.faoliyat,
              kredit_summa: s.profil.kredit_summa,
              hukm: baholash(s.profil, s.bajarilgan)?.hukm ?? null,
              bank_roziligi: s.bank_roziligi,
            }))
            .sort((a, b) => b.yangilangan.localeCompare(a.yangilangan)),
  });

  // ── Login ──

  app.post("/api/auth/register", async (c) => {
    if (!chegara(ip(c))) return xato(c, 429, "Juda ko'p urinish. Bir daqiqadan keyin qayta urinib ko'ring.");
    const b = await json(c);
    const ism = matn(b.ism, 60);
    const telefon = telefonTozala(matn(b.telefon, 30));
    const parol = typeof b.parol === "string" ? b.parol : "";
    if (!ism) return xato(c, 400, "Ismingizni yozing.");
    if (!telefon) return xato(c, 400, "Telefon raqam noto'g'ri. Masalan: 90 123 45 67.");
    if (parol.length < 6 || parol.length > 100) return xato(c, 400, "Parol kamida 6 belgi bo'lsin.");
    const f = hisoblar.yarat({ ism, telefon, parol, rol: "tadbirkor" });
    if (!f) return xato(c, 409, "Bu raqam bilan ro'yxatdan o'tilgan. Kirish sahifasidan kiring.");
    biriktir(f, b.sessiya_id);
    return c.json<KirishJavobi>({ token: hisoblar.tokenBer(f.id), foydalanuvchi: f }, 201);
  });

  app.post("/api/auth/login", async (c) => {
    if (!chegara(ip(c))) return xato(c, 429, "Juda ko'p urinish. Bir daqiqadan keyin qayta urinib ko'ring.");
    const b = await json(c);
    const telefon = telefonTozala(matn(b.telefon, 30));
    const parol = typeof b.parol === "string" ? b.parol : "";
    const f = telefon && parol ? hisoblar.kirish(telefon, parol) : null;
    if (!f) return xato(c, 401, "Telefon yoki parol noto'g'ri.");
    biriktir(f, b.sessiya_id);
    return c.json<KirishJavobi>({ token: hisoblar.tokenBer(f.id), foydalanuvchi: f });
  });

  app.post("/api/auth/logout", (c) => {
    if (token(c)) hisoblar.chiqish(token(c));
    return c.json({ ok: true });
  });

  app.get("/api/auth/me", (c) => {
    const f = talab(c);
    return f instanceof Response ? f : c.json(men(f));
  });

  /** Kirgan tadbirkorning suhbati hali yo'q bo'lsa — joriy suhbat unga biriktiriladi. */
  app.post("/api/auth/attach", async (c) => {
    const f = talab(c, "tadbirkor");
    if (f instanceof Response) return f;
    biriktir(f, (await json(c)).sessiya_id);
    return c.json(men(f));
  });

  // ── Bank oynasi ──

  const bankArizasi = (bankId: string, s: Sessiya): BankArizasiHolat | null => {
    const natija = baholash(s.profil, s.bajarilgan);
    if (!s.bank_roziligi || !natija) return null;
    const qaror = hisoblar.qaror(bankId, s.id) ?? { holat: "yangi" as const, yangilangan: s.yangilangan };
    return { id: s.id, yangilangan: s.yangilangan, profil: s.profil, natija, qaror };
  };

  /** Bank xodimi va uning faol shartnomali banki. */
  const bankXodimi = (c: Context): { f: Foydalanuvchi; bank: HamkorBank } | Response => {
    const f = talab(c, "bank");
    if (f instanceof Response) return f;
    const bank = f.bank_id ? hisoblar.bank(f.bank_id) : null;
    if (!bank) return xato(c, 403, "Bankingiz topilmadi. Admin bilan bog'laning.");
    if (bank.shartnoma !== "faol") return xato(c, 403, "Bankingiz shartnomasi faol emas. Arizalar shartnoma faollashgach ko'rinadi.");
    return { f, bank };
  };

  app.get("/api/bank/applications", (c) => {
    const x = bankXodimi(c);
    if (x instanceof Response) return x;
    const royxat = store
      .hammasi()
      .map((s) => bankArizasi(x.bank.id, s))
      .filter((a): a is BankArizasiHolat => a !== null)
      .sort((a, b) => b.yangilangan.localeCompare(a.yangilangan));
    return c.json(royxat);
  });

  app.get("/api/bank/applications/:id", (c) => {
    const x = bankXodimi(c);
    if (x instanceof Response) return x;
    const s = store.olish(c.req.param("id"));
    const a = s ? bankArizasi(x.bank.id, s) : null;
    if (!a) return xato(c, 404, "Ariza topilmadi yoki tadbirkor rozilikni qaytarib oldi.");
    return c.json(a);
  });

  app.post("/api/bank/applications/:id/decision", async (c) => {
    const x = bankXodimi(c);
    if (x instanceof Response) return x;
    const s = store.olish(c.req.param("id"));
    if (!s || !bankArizasi(x.bank.id, s)) return xato(c, 404, "Ariza topilmadi yoki tadbirkor rozilikni qaytarib oldi.");
    const b = await json(c);
    const holat = b.holat as ArizaHolati;
    if (!HOLATLAR.includes(holat)) return xato(c, 400, "Holat noto'g'ri.");
    const q: ArizaQarori = { holat, yangilangan: new Date().toISOString() };
    if (holat === "berildi") {
      const summa = Number(b.summa);
      if (!Number.isFinite(summa) || summa <= 0 || summa > MAX_SUMMA) {
        return xato(c, 400, "Berilgan kredit summasini so'mda yozing.");
      }
      q.summa = Math.round(summa);
      q.komissiya = komissiyaHisobla(q.summa, x.bank.komissiya_foiz);
    }
    if (holat === "rad") {
      const sabab = matn(b.sabab, 300);
      if (!sabab) return xato(c, 400, "Rad sababini yozing — tadbirkor shunga qarab tuzatadi.");
      q.sabab = sabab;
    }
    hisoblar.qarorSaqla(x.bank.id, s.id, q);
    return c.json(bankArizasi(x.bank.id, s));
  });

  const bankStat = (bankId: string, foiz: number) => {
    const holatlar = bosh();
    let berilgan_summa = 0;
    let komissiya = 0;
    for (const s of store.hammasi()) {
      const q = hisoblar.qaror(bankId, s.id);
      const korinadi = s.bank_roziligi && baholash(s.profil, s.bajarilgan);
      // Qaror qilingan ariza rozilik qaytarilsa ham hisobda qoladi (kredit berilgan bo'lishi mumkin)
      if (!q && !korinadi) continue;
      const h = q?.holat ?? "yangi";
      holatlar[h]++;
      if (h === "berildi" && q?.summa) {
        berilgan_summa += q.summa;
        komissiya += q.komissiya ?? komissiyaHisobla(q.summa, foiz);
      }
    }
    const jami = HOLATLAR.reduce((n, h) => n + holatlar[h], 0);
    return { jami, holatlar, berilgan_summa, komissiya };
  };

  app.get("/api/bank/stats", (c) => {
    const x = bankXodimi(c);
    if (x instanceof Response) return x;
    const { id, nom, komissiya_foiz, shartnoma } = x.bank;
    return c.json<BankHisobi>({ bank: { id, nom, komissiya_foiz, shartnoma }, ...bankStat(id, komissiya_foiz) });
  });

  // ── Admin panel ──

  const admin = (c: Context) => talab(c, "admin");

  const bankMalumoti = (b: Record<string, unknown>, toliq: boolean) => {
    const p: { nom?: string; shartnoma?: Shartnoma; komissiya_foiz?: number } = {};
    if (toliq || b.nom !== undefined) {
      p.nom = matn(b.nom, 80);
      if (!p.nom) return "Bank nomini yozing.";
    }
    if (toliq || b.shartnoma !== undefined) {
      if (!SHARTNOMALAR.includes(b.shartnoma as Shartnoma)) return "Shartnoma holati noto'g'ri.";
      p.shartnoma = b.shartnoma as Shartnoma;
    }
    if (toliq || b.komissiya_foiz !== undefined) {
      const f = Number(b.komissiya_foiz);
      if (!Number.isFinite(f) || f < 0 || f > 20) return "Komissiya 0 dan 20 foizgacha bo'lsin.";
      p.komissiya_foiz = Math.round(f * 100) / 100;
    }
    return p;
  };

  app.get("/api/admin/banks", (c) => {
    const f = admin(c);
    return f instanceof Response ? f : c.json(hisoblar.banklar());
  });

  app.post("/api/admin/banks", async (c) => {
    const f = admin(c);
    if (f instanceof Response) return f;
    const p = bankMalumoti(await json(c), true);
    if (typeof p === "string") return xato(c, 400, p);
    return c.json(hisoblar.bankYarat(p as Required<typeof p>), 201);
  });

  app.post("/api/admin/banks/:id", async (c) => {
    const f = admin(c);
    if (f instanceof Response) return f;
    const p = bankMalumoti(await json(c), false);
    if (typeof p === "string") return xato(c, 400, p);
    const b = hisoblar.bankYangila(c.req.param("id"), p);
    return b ? c.json(b) : xato(c, 404, "Bank topilmadi.");
  });

  app.post("/api/admin/banks/:id/staff", async (c) => {
    const f = admin(c);
    if (f instanceof Response) return f;
    const bank = hisoblar.bank(c.req.param("id"));
    if (!bank) return xato(c, 404, "Bank topilmadi.");
    const b = await json(c);
    const ism = matn(b.ism, 60);
    const telefon = telefonTozala(matn(b.telefon, 30));
    const parol = typeof b.parol === "string" ? b.parol : "";
    if (!ism) return xato(c, 400, "Xodim ismini yozing.");
    if (!telefon) return xato(c, 400, "Telefon raqam noto'g'ri.");
    if (parol.length < 6 || parol.length > 100) return xato(c, 400, "Parol kamida 6 belgi bo'lsin.");
    const x = hisoblar.yarat({ ism, telefon, parol, rol: "bank", bank_id: bank.id });
    if (!x) return xato(c, 409, "Bu raqam bilan akkaunt bor.");
    return c.json(hisoblar.bank(bank.id), 201);
  });

  app.get("/api/admin/report", (c) => {
    const f = admin(c);
    if (f instanceof Response) return f;

    const foydalanuvchilar: Record<Rol, number> = { tadbirkor: 0, bank: 0, admin: 0 };
    for (const u of hisoblar.foydalanuvchilar()) foydalanuvchilar[u.rol]++;

    const hukmlar: Record<Hukm, number> = { tayyor: 0, hali_emas: 0, olmang: 0 };
    const sessiyalar = store.hammasi();
    let tugallangan = 0;
    let rozilik = 0;
    for (const s of sessiyalar) {
      const n = baholash(s.profil, s.bajarilgan);
      if (n) {
        tugallangan++;
        hukmlar[n.hukm]++;
      }
      if (s.bank_roziligi && n) rozilik++;
    }

    const kunlik: AdminHisobot["kunlik"] = [];
    for (let i = 6; i >= 0; i--) {
      const sana = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
      kunlik.push({ sana, soni: sessiyalar.filter((s) => s.yaratilgan.slice(0, 10) === sana).length });
    }

    const banklar = hisoblar.banklar().map((b) => {
      const st = bankStat(b.id, b.komissiya_foiz);
      return {
        id: b.id,
        nom: b.nom,
        shartnoma: b.shartnoma,
        komissiya_foiz: b.komissiya_foiz,
        holatlar: st.holatlar,
        berilgan_summa: st.berilgan_summa,
        komissiya: st.komissiya,
      };
    });

    return c.json<AdminHisobot>({
      foydalanuvchilar,
      suhbatlar: { jami: sessiyalar.length, tugallangan, hukmlar, rozilik },
      kunlik,
      banklar,
      jami: {
        berilgan_kredit: banklar.reduce((n, b) => n + b.holatlar.berildi, 0),
        berilgan_summa: banklar.reduce((n, b) => n + b.berilgan_summa, 0),
        daromad: banklar.reduce((n, b) => n + b.komissiya, 0),
      },
    });
  });
}
