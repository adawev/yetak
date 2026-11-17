// Agentdan kelgan profil maydonlarini tekshiradi. Noto'g'ri qiymat profilga tushmaydi.

import type { KreditTarixi, Profil, Shakl } from "../../shared/types";

const SHAKLLAR: Shakl[] = ["yatt", "mchj", "ozini_band", "norasmiy"];
const TARIXLAR: KreditTarixi[] = ["yaxshi", "yomon", "yoq"];

const matn = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : undefined;

const son = (v: unknown, max: number, min = 0) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? Math.round(v) : undefined;

const MLRD = 1_000_000_000;

/** Faqat to'g'ri qiymatlarni qaytaradi. null / yo'q — o'tkazib yuboriladi. */
export function profilniTozalash(kirish: unknown): Partial<Profil> {
  if (!kirish || typeof kirish !== "object") return {};
  const k = kirish as Record<string, unknown>;
  const p: Partial<Profil> = {
    faoliyat: matn(k.faoliyat),
    shakl: SHAKLLAR.includes(k.shakl as Shakl) ? (k.shakl as Shakl) : undefined,
    faoliyat_oy: son(k.faoliyat_oy, 1200),
    oylik_tushum: son(k.oylik_tushum, 1000 * MLRD),
    oylik_xarajat: son(k.oylik_xarajat, 1000 * MLRD),
    kredit_summa: son(k.kredit_summa, 1000 * MLRD, 1),
    kredit_muddat_oy: son(k.kredit_muddat_oy, 360, 1),
    maqsad: matn(k.maqsad),
    garov_qiymati: son(k.garov_qiymati, 10_000 * MLRD),
    kredit_tarixi: TARIXLAR.includes(k.kredit_tarixi as KreditTarixi)
      ? (k.kredit_tarixi as KreditTarixi)
      : undefined,
    avval_mikrokredit: typeof k.avval_mikrokredit === "boolean" ? k.avval_mikrokredit : undefined,
    eri_bor: typeof k.eri_bor === "boolean" ? k.eri_bor : undefined,
  };
  for (const kalit of Object.keys(p) as (keyof Profil)[]) {
    if (p[kalit] === undefined) delete p[kalit];
  }
  return p;
}
