// NAMUNA ma'lumotlar — faqat web'ni server tayyor bo'lguncha sinash uchun.
// Raqamlar va matnlar o'ylab topilgan, haqiqiy bank sharti EMAS.
import type { Natija, Profil } from '@shared/types'

export type SsenariyNomi = 'tayyor' | 'hali_emas' | 'olmang'

export interface Ssenariy {
  profil: Required<Profil>
  natija: Natija
}

export const SSENARIYLAR: Record<SsenariyNomi, Ssenariy> = {
  tayyor: {
    profil: {
      faoliyat: 'Tikuv sexi',
      shakl: 'yatt',
      faoliyat_oy: 30,
      oylik_tushum: 60_000_000,
      oylik_xarajat: 38_000_000,
      kredit_summa: 100_000_000,
      kredit_muddat_oy: 24,
      maqsad: 'Yangi tikuv mashinalari',
      garov_qiymati: 150_000_000,
      kredit_tarixi: 'yaxshi',
      avval_mikrokredit: true,
      eri_bor: true,
    },
    natija: {
      hukm: 'tayyor',
      xulosa: "Asosiy talablarga mos kelasiz. Arizani topshirishingiz mumkin (namuna).",
      topilmalar: [
        { kalit: 'muddat', daraja: 'yaxshi', matn: 'Faoliyat muddati yetarli (namuna)', taxmin: true },
        { kalit: 'garov', daraja: 'yaxshi', matn: 'Garov yetarli (namuna)', taxmin: true },
        { kalit: 'tarix', daraja: 'yaxshi', matn: 'Kredit tarixi yaxshi (namuna)', taxmin: true },
      ],
      qadamlar: [
        { kalit: 'hujjat', sarlavha: "Hujjatlarni bir joyga to'plash", izoh: 'Namuna qadam', bajarildi: true },
        { kalit: 'tadbircore', sarlavha: 'TadbirCore orqali ariza berish', izoh: 'Namuna qadam', bajarildi: false },
      ],
      hisob: { oylik_foyda: 22_000_000, oylik_tolov: 5_600_000, yillik_stavka: 24, kerakli_garov: 125_000_000 },
    },
  },
  hali_emas: {
    profil: {
      faoliyat: 'Non sexi',
      shakl: 'yatt',
      faoliyat_oy: 14,
      oylik_tushum: 40_000_000,
      oylik_xarajat: 28_000_000,
      kredit_summa: 120_000_000,
      kredit_muddat_oy: 24,
      maqsad: 'Tandir va xamir mashinasi',
      garov_qiymati: 60_000_000,
      kredit_tarixi: 'yoq',
      avval_mikrokredit: false,
      eri_bor: false,
    },
    natija: {
      hukm: 'hali_emas',
      xulosa: "2 ta to'siq bor. Ularni yopsangiz, ariza berishga tayyor bo'lasiz (namuna).",
      topilmalar: [
        { kalit: 'muddat', daraja: 'yaxshi', matn: 'Faoliyat 14 oy (namuna)', taxmin: true },
        { kalit: 'garov', daraja: 'ogohlantirish', matn: 'Garov yetmaydi (namuna)', taxmin: true },
        { kalit: 'eri', daraja: 'tosiq', matn: "Elektron imzo yo'q (namuna)", taxmin: true },
      ],
      qadamlar: [
        { kalit: 'eri', sarlavha: 'Elektron imzo olish', izoh: 'Namuna qadam', bajarildi: false },
        { kalit: 'kafolat', sarlavha: "Garov kafolati dasturini o'rganish", izoh: 'Namuna qadam', bajarildi: false },
        { kalit: 'bank', sarlavha: 'Bankka murojaat', izoh: 'Namuna qadam', bajarildi: false },
      ],
      hisob: { oylik_foyda: 12_000_000, oylik_tolov: 6_300_000, yillik_stavka: 24, kerakli_garov: 150_000_000 },
    },
  },
  olmang: {
    profil: {
      faoliyat: 'Kiyim savdosi',
      shakl: 'ozini_band',
      faoliyat_oy: 5,
      oylik_tushum: 15_000_000,
      oylik_xarajat: 13_500_000,
      kredit_summa: 80_000_000,
      kredit_muddat_oy: 12,
      maqsad: "Ko'proq mol olish",
      garov_qiymati: 0,
      kredit_tarixi: 'yomon',
      avval_mikrokredit: false,
      eri_bor: false,
    },
    natija: {
      hukm: 'olmang',
      xulosa: "Hozir qarz olmang: oylik to'lov foydangizdan katta bo'lib qoladi (namuna).",
      topilmalar: [
        { kalit: 'oqim', daraja: 'tosiq', matn: "Oylik to'lov foydadan katta (namuna)", taxmin: true },
        { kalit: 'muddat', daraja: 'ogohlantirish', matn: 'Faoliyat muddati qisqa (namuna)', taxmin: true },
        { kalit: 'tarix', daraja: 'tosiq', matn: 'Kredit tarixi salbiy (namuna)', taxmin: true },
      ],
      qadamlar: [
        { kalit: 'hisob', sarlavha: 'Tushum va xarajatni 3 oy yozib borish', izoh: 'Namuna qadam', bajarildi: false },
        { kalit: 'qarz', sarlavha: "Eski qarzni yopish", izoh: 'Namuna qadam', bajarildi: false },
      ],
      hisob: { oylik_foyda: 1_500_000, oylik_tolov: 7_600_000, yillik_stavka: 24, kerakli_garov: 100_000_000 },
    },
  },
}
