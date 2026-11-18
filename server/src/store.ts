// Oddiy fayl saqlash: bitta JSON fayl. Xotirada Map, har o'zgarishda faylga yoziladi.
// Yozish atomik: avval vaqtinchalik faylga, keyin nomini almashtirish.

import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Profil, Xabar, YuklanganFayl } from "../../shared/types";

export interface Sessiya {
  id: string;
  yaratilgan: string;
  yangilangan: string;
  xabarlar: Xabar[];
  profil: Profil;
  tugmalar: string[];
  bajarilgan: string[];
  bank_roziligi: boolean;
  /** Tadbirkor tanlagan bank mahsuloti (papka uchun). Yo'q bo'lsa — eng mosi. */
  mahsulot?: string;
  /** Yuklangan hujjatlar: hujjat kaliti → fayl ma'lumoti. Faylning o'zi FaylOmbor da. */
  fayllar?: Record<string, YuklanganFayl>;
}

/** Yuklangan fayllar (shaxsiy hujjatlar). Sessiya o'chganda fayllari ham o'chadi. */
export interface FaylOmbor {
  yoz(sessiya: string, kalit: string, data: Buffer): void;
  oqi(sessiya: string, kalit: string): Buffer | null;
  ochir(sessiya: string, kalit: string): void;
}

export class XotiraFaylOmbor implements FaylOmbor {
  private m = new Map<string, Buffer>();
  yoz(s: string, k: string, d: Buffer) {
    this.m.set(`${s}/${k}`, d);
  }
  oqi(s: string, k: string) {
    return this.m.get(`${s}/${k}`) ?? null;
  }
  ochir(s: string, k: string) {
    this.m.delete(`${s}/${k}`);
  }
}

const XAVFSIZ = /^[a-z0-9_-]+$/i;

export class DiskFaylOmbor implements FaylOmbor {
  constructor(private papka: string) {
    mkdirSync(papka, { recursive: true, mode: 0o700 });
  }
  private yol(s: string, k: string) {
    if (!XAVFSIZ.test(s) || !XAVFSIZ.test(k)) throw new Error("noto'g'ri kalit");
    return join(this.papka, s, k);
  }
  yoz(s: string, k: string, d: Buffer) {
    mkdirSync(join(this.papka, s), { recursive: true, mode: 0o700 });
    const y = this.yol(s, k);
    writeFileSync(`${y}.tmp`, d, { mode: 0o600 });
    renameSync(`${y}.tmp`, y);
  }
  oqi(s: string, k: string) {
    const y = this.yol(s, k);
    return existsSync(y) ? readFileSync(y) : null;
  }
  ochir(s: string, k: string) {
    rmSync(this.yol(s, k), { force: true });
  }
  /** Tirik sessiyalarga tegishli bo'lmagan papkalarni o'chiradi (muddati o'tgan sessiyalar). */
  tozala(tirik: Set<string>) {
    for (const d of readdirSync(this.papka)) {
      if (!tirik.has(d)) rmSync(join(this.papka, d), { recursive: true, force: true });
    }
  }
}

export interface Store {
  olish(id: string): Sessiya | undefined;
  saqlash(s: Sessiya): void;
  hammasi(): Sessiya[];
}

export class XotiraStore implements Store {
  protected map = new Map<string, Sessiya>();
  olish(id: string) {
    return this.map.get(id);
  }
  saqlash(s: Sessiya) {
    s.yangilangan = new Date().toISOString();
    this.map.set(s.id, s);
  }
  hammasi() {
    return [...this.map.values()];
  }
}

export class FaylStore extends XotiraStore {
  private fayl: string;
  private yozishKerak = false;
  private yozilmoqda = false;

  constructor(papka: string, saqlashKun: number) {
    super();
    mkdirSync(papka, { recursive: true });
    this.fayl = join(papka, "sessions.json");
    if (existsSync(this.fayl)) {
      const royxat = JSON.parse(readFileSync(this.fayl, "utf8")) as Sessiya[];
      const chegara = Date.now() - saqlashKun * 86_400_000;
      for (const s of royxat) {
        if (Date.parse(s.yangilangan) >= chegara) this.map.set(s.id, s);
      }
    }
  }

  override saqlash(s: Sessiya) {
    super.saqlash(s);
    this.yozish();
  }

  /** Ketma-ket ko'p o'zgarish bo'lsa ham bir vaqtda faqat bitta yozish. */
  private yozish() {
    this.yozishKerak = true;
    if (this.yozilmoqda) return;
    this.yozilmoqda = true;
    queueMicrotask(() => {
      try {
        while (this.yozishKerak) {
          this.yozishKerak = false;
          const vaqtinchalik = `${this.fayl}.tmp`;
          writeFileSync(vaqtinchalik, JSON.stringify(this.hammasi()));
          renameSync(vaqtinchalik, this.fayl);
        }
      } catch (e) {
        console.error("saqlash xatosi:", (e as Error).message);
      } finally {
        this.yozilmoqda = false;
      }
    });
  }
}
