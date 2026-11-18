import { Info } from 'lucide-react'
import { MahsulotlarBlok } from '@/components/Mahsulotlar'
import { GarovBlok, HukmBlok, PulOqimiBlok, RozilikBlok, YolXaritasiBlok } from '@/components/bloklar'
import type { Sessiya } from '@/hooks/useSessiya'

export function Jarayon({ toldirilgan, jami }: { toldirilgan: number; jami: number }) {
  const tayyor = jami > 0 && toldirilgan >= jami
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted-foreground">{tayyor ? 'Savollar tugadi' : 'Savollar'}</span>
        <span className="font-medium tabular-nums">
          {toldirilgan} / {jami}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-foreground/10"
        role="progressbar"
        aria-valuenow={toldirilgan}
        aria-valuemax={jami}
      >
        <div
          className={`h-full rounded-full transition-all ${tayyor ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${jami ? (toldirilgan / jami) * 100 : 0}%` }}
        />
      </div>
    </div>
  )
}

export function Panel({ s }: { s: Sessiya }) {
  const h = s.holat
  if (!h) return null
  const { natija, profil } = h
  return (
    <div className="space-y-3">
      {/* Telefonda jarayon tepada turadi */}
      <div className="hidden lg:block">
        <Jarayon {...h.jarayon} />
      </div>
      {!natija && (
        <div className="flex gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0" />
          Savollarga javob bering — natija va yo'l xaritangiz shu yerda chiqadi.
        </div>
      )}
      {natija && (
        <>
          <HukmBlok natija={natija} />
          {h.mahsulotlar && <MahsulotlarBlok mahsulotlar={h.mahsulotlar} />}
          <YolXaritasiBlok qadamlar={natija.qadamlar} onBelgila={s.qadamBelgila} />
          {profil.oylik_tushum !== undefined && profil.oylik_xarajat !== undefined && (
            <PulOqimiBlok
              tushum={profil.oylik_tushum}
              xarajat={profil.oylik_xarajat}
              foyda={natija.hisob.oylik_foyda}
              tolov={natija.hisob.oylik_tolov}
              stavka={natija.hisob.yillik_stavka}
            />
          )}
          {profil.garov_qiymati !== undefined && (
            <GarovBlok bor={profil.garov_qiymati} kerak={natija.hisob.kerakli_garov} />
          )}
          <RozilikBlok rozi={h.bank_roziligi} onOzgartir={s.rozilikBer} />
        </>
      )}
    </div>
  )
}
