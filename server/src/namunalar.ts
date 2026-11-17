// Demo va sinov uchun 3 xil tadbirkor (to'qima, haqiqiy odam emas).

import type { Profil } from "../../shared/types";

export const NAMUNALAR: Record<"tayyor" | "hali_emas" | "olmang", Profil> = {
  tayyor: {
    faoliyat: "tikuv sexi",
    shakl: "yatt",
    faoliyat_oy: 24,
    oylik_tushum: 60_000_000,
    oylik_xarajat: 40_000_000,
    kredit_summa: 100_000_000,
    kredit_muddat_oy: 24,
    maqsad: "yangi tikuv mashinalari",
    garov_qiymati: 150_000_000,
    kredit_tarixi: "yaxshi",
    avval_mikrokredit: false,
    eri_bor: true,
  },
  hali_emas: {
    faoliyat: "oziq-ovqat do'koni",
    shakl: "yatt",
    faoliyat_oy: 18,
    oylik_tushum: 40_000_000,
    oylik_xarajat: 30_000_000,
    kredit_summa: 80_000_000,
    kredit_muddat_oy: 24,
    maqsad: "tovar zaxirasi",
    garov_qiymati: 0,
    kredit_tarixi: "yoq",
    avval_mikrokredit: false,
    eri_bor: false,
  },
  olmang: {
    faoliyat: "kafe",
    shakl: "yatt",
    faoliyat_oy: 8,
    oylik_tushum: 30_000_000,
    oylik_xarajat: 28_000_000,
    kredit_summa: 100_000_000,
    kredit_muddat_oy: 12,
    maqsad: "ta'mirlash",
    garov_qiymati: 0,
    kredit_tarixi: "yaxshi",
    avval_mikrokredit: false,
    eri_bor: true,
  },
};
