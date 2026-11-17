// Oddiy fayl saqlash: bitta JSON fayl. Xotirada Map, har o'zgarishda faylga yoziladi.
// Yozish atomik: avval vaqtinchalik faylga, keyin nomini almashtirish.

import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Profil, Xabar } from "../../shared/types";

export interface Sessiya {
  id: string;
  yaratilgan: string;
  yangilangan: string;
  xabarlar: Xabar[];
  profil: Profil;
  tugmalar: string[];
  bajarilgan: string[];
  bank_roziligi: boolean;
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
