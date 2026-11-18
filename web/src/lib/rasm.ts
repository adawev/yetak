const XATO_TUR = "Bu rasm turini o'qib bo'lmadi. Telefonda «JPG» qilib saqlang yoki skrinshot oling."
const PDF_MAKS = 10 * 1024 * 1024
const JPG_MAKS = 4.5 * 1024 * 1024

export const RASM_XOM_MAKS = 25 * 1024 * 1024
export const PDF_KATTA = 'PDF juda katta (10 MB gacha). Kamroq sahifali qilib saqlang.'

export function rasmmi(f: File): boolean {
  return f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)
}

async function siq(bmp: ImageBitmap, uzun: number, sifat: number): Promise<Blob> {
  const k = Math.min(1, uzun / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * k))
  const h = Math.max(1, Math.round(bmp.height * k))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error(XATO_TUR)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bmp, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', sifat))
  if (!blob) throw new Error(XATO_TUR)
  return blob
}

export async function hujjatniTayyorla(file: File): Promise<File> {
  if (file.type === 'application/pdf') {
    if (file.size > PDF_MAKS) throw new Error(PDF_KATTA)
    return file
  }
  if (!rasmmi(file)) throw new Error(XATO_TUR)
  let bmp: ImageBitmap
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(XATO_TUR)
  }
  try {
    let blob = await siq(bmp, 2000, 0.82)
    if (blob.size > JPG_MAKS) blob = await siq(bmp, 1600, 0.75)
    const nom = file.name.replace(/\.[^.]+$/, '') || 'rasm'
    return new File([blob], `${nom}.jpg`, { type: 'image/jpeg' })
  } finally {
    bmp.close()
  }
}
