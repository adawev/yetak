// Natijaning yagona kirish nuqtasi: qoidalar (rules.ts) + aniq bank mahsulotlari (mahsulotlar.ts) birga.
// Server, agent va bank oynasi hukmni faqat shu yerdan oladi — ikki joyda ikki xil hukm chiqmasin.

import type { Natija, Profil } from "../../shared/types";
import { mahsulotlarniMoslash } from "./mahsulotlar";
import { baholash } from "./rules";

export function natijaHisobla(profil: Profil, bajarilgan: string[] = []): Natija | null {
  return baholash(profil, bajarilgan, mahsulotlarniMoslash(profil));
}
