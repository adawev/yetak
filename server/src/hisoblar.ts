// Foydalanuvchilar, tokenlar, hamkor banklar va bank qarorlari.
// Bitta JSON fayl (data/hisoblar.json), atomik yozish. Parol scrypt bilan xeshlanadi,
// token faqat sha256 xeshi bilan saqlanadi — fayl o'g'irlansa ham kirib bo'lmaydi.

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ArizaQarori, Foydalanuvchi, HamkorBank, Rol, Shartnoma } from "../../shared/types";

interface FoydalanuvchiYozuv extends Foydalanuvchi {
  parol: string; // "tuz:xesh" (hex)
  sessiyalar: string[];
}
interface TokenYozuv {
  xesh: string;
  foydalanuvchi_id: string;
  tugaydi: string;
}
type BankYozuv = Omit<HamkorBank, "xodimlar">;

interface Malumot {
  foydalanuvchilar: FoydalanuvchiYozuv[];
  tokenlar: TokenYozuv[];
  banklar: BankYozuv[];
  /** kalit: `${bank_id}:${sessiya_id}` */
  qarorlar: Record<string, ArizaQarori>;
}

const TOKEN_KUN = 30;

/** Telefonni "998XXXXXXXXX" ko'rinishiga keltiradi. Noto'g'ri bo'lsa null. */
export function telefonTozala(t: string): string | null {
  const r = t.replace(/\D/g, "");
  const toliq = r.length === 9 ? `998${r}` : r;
  return /^998\d{9}$/.test(toliq) ? toliq : null;
}

function parolXesh(parol: string): string {
  const tuz = randomBytes(16);
  return `${tuz.toString("hex")}:${scryptSync(parol, tuz, 32).toString("hex")}`;
}

function parolTekshir(parol: string, saqlangan: string): boolean {
  const [tuz, xesh] = saqlangan.split(":");
  if (!tuz || !xesh) return false;
  const kutilgan = Buffer.from(xesh, "hex");
  const hisob = scryptSync(parol, Buffer.from(tuz, "hex"), kutilgan.length);
  return timingSafeEqual(hisob, kutilgan);
}

const tokenXesh = (t: string) => createHash("sha256").update(t).digest("hex");

const ochiq = (f: FoydalanuvchiYozuv): Foydalanuvchi => ({
  id: f.id,
  ism: f.ism,
  telefon: f.telefon,
  rol: f.rol,
  ...(f.bank_id ? { bank_id: f.bank_id } : {}),
  yaratilgan: f.yaratilgan,
});

export class Hisoblar {
  private m: Malumot = { foydalanuvchilar: [], tokenlar: [], banklar: [], qarorlar: {} };
  private fayl: string | null;

  /** papka berilmasa — faqat xotirada (testlar uchun). */
  constructor(papka?: string) {
    this.fayl = null;
    if (!papka) return;
    mkdirSync(papka, { recursive: true });
    this.fayl = join(papka, "hisoblar.json");
    if (existsSync(this.fayl)) this.m = { ...this.m, ...JSON.parse(readFileSync(this.fayl, "utf8")) };
    const hozir = new Date().toISOString();
    this.m.tokenlar = this.m.tokenlar.filter((t) => t.tugaydi > hozir);
  }

  private yoz() {
    if (!this.fayl) return;
    const vaqtinchalik = `${this.fayl}.tmp`;
    writeFileSync(vaqtinchalik, JSON.stringify(this.m));
    renameSync(vaqtinchalik, this.fayl);
  }

  // ── Foydalanuvchilar ──

  /** Yangi foydalanuvchi. Telefon band bo'lsa null. */
  yarat(p: { ism: string; telefon: string; parol: string; rol: Rol; bank_id?: string }): Foydalanuvchi | null {
    if (this.m.foydalanuvchilar.some((f) => f.telefon === p.telefon)) return null;
    const f: FoydalanuvchiYozuv = {
      id: randomUUID(),
      ism: p.ism,
      telefon: p.telefon,
      rol: p.rol,
      ...(p.bank_id ? { bank_id: p.bank_id } : {}),
      yaratilgan: new Date().toISOString(),
      parol: parolXesh(p.parol),
      sessiyalar: [],
    };
    this.m.foydalanuvchilar.push(f);
    this.yoz();
    return ochiq(f);
  }

  kirish(telefon: string, parol: string): Foydalanuvchi | null {
    const f = this.m.foydalanuvchilar.find((x) => x.telefon === telefon);
    return f && parolTekshir(parol, f.parol) ? ochiq(f) : null;
  }

  foydalanuvchilar(): Foydalanuvchi[] {
    return this.m.foydalanuvchilar.map(ochiq);
  }

  /** Admin yo'q bo'lsa — muhit o'zgaruvchilaridan yaratadi. */
  adminTayyorla(telefon?: string, parol?: string) {
    if (this.m.foydalanuvchilar.some((f) => f.rol === "admin")) return;
    const t = telefon ? telefonTozala(telefon) : null;
    if (!t || !parol) {
      console.warn("Admin yo'q: ADMIN_TELEFON va ADMIN_PAROL ni server/.env ga yozing.");
      return;
    }
    this.yarat({ ism: "Admin", telefon: t, parol, rol: "admin" });
    console.log("Admin akkaunti yaratildi.");
  }

  // ── Tokenlar ──

  tokenBer(foydalanuvchiId: string): string {
    const token = randomBytes(32).toString("hex");
    this.m.tokenlar.push({
      xesh: tokenXesh(token),
      foydalanuvchi_id: foydalanuvchiId,
      tugaydi: new Date(Date.now() + TOKEN_KUN * 86_400_000).toISOString(),
    });
    this.yoz();
    return token;
  }

  tokenEgasi(token: string): Foydalanuvchi | null {
    const x = tokenXesh(token);
    const t = this.m.tokenlar.find((y) => y.xesh === x && y.tugaydi > new Date().toISOString());
    const f = t && this.m.foydalanuvchilar.find((y) => y.id === t.foydalanuvchi_id);
    return f ? ochiq(f) : null;
  }

  chiqish(token: string) {
    const x = tokenXesh(token);
    this.m.tokenlar = this.m.tokenlar.filter((t) => t.xesh !== x);
    this.yoz();
  }

  // ── Tadbirkor suhbatlari ──

  /** Tadbirkorning bitta suhbati bor: allaqachon bo'lsa — o'zgarmaydi. */
  sessiyaBiriktir(foydalanuvchiId: string, sessiyaId: string) {
    const f = this.m.foydalanuvchilar.find((x) => x.id === foydalanuvchiId);
    if (!f || f.sessiyalar.length > 0) return;
    f.sessiyalar.push(sessiyaId);
    this.yoz();
  }

  sessiyalari(foydalanuvchiId: string): string[] {
    return this.m.foydalanuvchilar.find((x) => x.id === foydalanuvchiId)?.sessiyalar ?? [];
  }

  // ── Hamkor banklar ──

  banklar(): HamkorBank[] {
    return this.m.banklar.map((b) => this.bankOchiq(b));
  }

  bank(id: string): HamkorBank | null {
    const b = this.m.banklar.find((x) => x.id === id);
    return b ? this.bankOchiq(b) : null;
  }

  private bankOchiq(b: BankYozuv): HamkorBank {
    return {
      ...b,
      xodimlar: this.m.foydalanuvchilar.filter((f) => f.rol === "bank" && f.bank_id === b.id).map(ochiq),
    };
  }

  bankYarat(p: { nom: string; shartnoma: Shartnoma; komissiya_foiz: number }): HamkorBank {
    const b: BankYozuv = { id: randomUUID(), ...p, yaratilgan: new Date().toISOString() };
    this.m.banklar.push(b);
    this.yoz();
    return this.bankOchiq(b);
  }

  bankYangila(id: string, p: Partial<Pick<BankYozuv, "nom" | "shartnoma" | "komissiya_foiz">>): HamkorBank | null {
    const b = this.m.banklar.find((x) => x.id === id);
    if (!b) return null;
    Object.assign(b, p);
    this.yoz();
    return this.bankOchiq(b);
  }

  // ── Bank qarorlari ──

  qaror(bankId: string, sessiyaId: string): ArizaQarori | null {
    return this.m.qarorlar[`${bankId}:${sessiyaId}`] ?? null;
  }

  qarorSaqla(bankId: string, sessiyaId: string, q: ArizaQarori) {
    this.m.qarorlar[`${bankId}:${sessiyaId}`] = q;
    this.yoz();
  }
}
