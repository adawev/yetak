// Kredit tarixi kartasi: rozilik → byuroga so'rov → natija.
// DEMO SIMULYATSIYASI: kredit byurosiga hali ulanmaganmiz (litsenziya/hamkorlik kerak).
// Natija tadbirkor suhbatda aytgan `kredit_tarixi` va `avval_mikrokredit` dan chiziladi,
// hech qanday raqam o'ylab topilmaydi. Pitchda bu simulyatsiya ekani aytiladi (docs/DEMO.md).
import type { KreditTarixi } from '@shared/types'
import { CheckCircle2, CircleX, FileSearch, Loader2, MinusCircle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Karta } from '@/components/bloklar'

const NATIJA: Record<KreditTarixi, { belgi: ReactNode; sarlavha: string; rang: string; qatorlar: string[] }> = {
  yaxshi: {
    belgi: <CheckCircle2 size={18} />,
    sarlavha: 'Ijobiy kredit tarixi',
    rang: 'bg-success/15 text-success',
    qatorlar: ["Muddati o'tgan qarz: yo'q", 'Kredit tarixi talabi bajarilgan'],
  },
  yoq: {
    belgi: <MinusCircle size={18} />,
    sarlavha: 'Kredit tarixi mavjud emas',
    rang: 'bg-foreground/10 text-foreground',
    qatorlar: ["Muddati o'tgan qarz: yo'q", "Hamkorbank sharti: «ijobiy yoki umuman yo'q» — mos"],
  },
  yomon: {
    belgi: <CircleX size={18} />,
    sarlavha: 'Salbiy kredit tarixi',
    rang: 'bg-destructive/15 text-destructive',
    qatorlar: ["Muddati o'tgan qarz qayd etilgan", "Avval eski qarzni yopish kerak — bank shu sababli rad etadi"],
  },
}

const vaqt = () => new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })

export function KreditTarixiBlok({ tarix, mikrokredit }: { tarix: KreditTarixi; mikrokredit?: boolean }) {
  const [holat, setHolat] = useState<'boshida' | 'sorov' | 'tayyor'>('boshida')
  const [soat, setSoat] = useState('')

  const tekshir = () => {
    setHolat('sorov')
    setTimeout(() => {
      setSoat(vaqt())
      setHolat('tayyor')
    }, 1800)
  }

  const n = NATIJA[tarix]
  const qatorlar = mikrokredit ? [...n.qatorlar, 'Avvalgi mikrokredit: vaqtida qaytarilgan'] : n.qatorlar

  return (
    <Karta>
      <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <FileSearch size={16} />
        Kredit tarixi
        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">Namuna</span>
      </p>

      {holat === 'boshida' && (
        <>
          <p className="text-sm">Bank kredit tarixingizni kredit byurosidan tekshiradi. Javob qanday ko'rinishini namunada ko'rasizmi? (Haqiqiy so'rov yuborilmaydi.)</p>
          <button
            type="button"
            onClick={tekshir}
            className="mt-2 min-h-11 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Namunani ko'rish
          </button>
        </>
      )}

      {holat === 'sorov' && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Namuna: kredit byurosi javobi shunday ko'rinadi…
        </p>
      )}

      {holat === 'tayyor' && (
        <>
          <div className={`flex items-center gap-2 rounded-md px-2.5 py-2 font-semibold ${n.rang}`}>
            {n.belgi}
            {n.sarlavha}
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {qatorlar.map((q) => (
              <li key={q}>• {q}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Namuna (haqiqiy so'rov emas) · aytganlaringiz asosida · {soat}</p>
        </>
      )}
    </Karta>
  )
}
