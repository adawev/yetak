# Loyiha ko'rsatmalari (agentlar uchun)

Yetak — Umummilliy AI Xakaton loyihasi.

## Mahsulot bir gapda

Sun'iy intellektli agent tadbirkorning kredit hujjatlarini u bilan birga tayyorlaydi va tayyor holda bankka yetkazadi.

## Avval o'qi

- `docs/VISION.md` — nima, kimga, pul
- `docs/QARORLAR.md` — jamoa qabul qilgan qarorlar. Bularni qayta muhokama qilma.
- `docs/RAQOBAT.md` — TadbirCore'dan farqimiz
- `docs/OCHIQ-SAVOLLAR.md` — javobi yo'q savollar
- `docs/TANQID.md` — mustaqil ko'z bilan tanqid va javoblar
- `docs/MEZONLAR.md` — hakamlar nimaga ball qo'yadi

## Qoidalar

- **Faktni o'ylab topma.** Bank qoidasi, kredit sharti, soliq chegarasi, narx, foiz — manbasiz yozilmaydi. Bilmasang `OCHIQ-SAVOLLAR.md` ga qo'sh va so'ra.
- **Hisobni kod qiladi.** Sun'iy intellekt gaplashadi, tushuntiradi, hujjatni o'qiydi. Raqamni hisoblamaydi.
- **Bir joyda bir mantiq.** Tekshiruv qoidalari bitta joyda turadi, bot va veb undan foydalanadi.
- **Shaxsiy ma'lumot.** Tadbirkorning roziligisiz hech narsa bankka yuborilmaydi. Keraksiz ma'lumot saqlanmaydi. Log'larga shaxsiy ma'lumot yozilmaydi.
- **Va'da bermaymiz.** «Kredit olasiz» demaymiz. «Arizangiz tayyor» deymiz.
- **Til.** Foydalanuvchiga o'zbekcha, oddiy so'zlar bilan. Bank atamasi ishlatilsa, darhol tushuntiriladi.
- **Tayyor demoga ustunlik.** Xakaton: 19-noyabr 10:00 da taqdimot. Ishlaydigan tor yo'l keng chala yo'ldan yaxshi.

## Yangi qaror

Jamoa biror narsani hal qilsa, `docs/QARORLAR.md` ga sana bilan yoziladi.
