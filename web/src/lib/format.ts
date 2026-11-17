// Faqat ko'rsatish uchun formatlash. Hech qanday hisob yo'q.

const nf = new Intl.NumberFormat('ru-RU') // 12 500 000 ko'rinishi
const yoz: (n: number) => string = nf.format.bind(nf)

export const som = (n: number) => `${yoz(Math.round(n))} so'm`

export const qisqaSom = (n: number) => {
  const q = (x: number) => yoz(Math.round(x * 10) / 10)
  if (n >= 1e9) return `${q(n / 1e9)} mlrd`
  if (n >= 1e6) return `${q(n / 1e6)} mln`
  return yoz(Math.round(n))
}

export const foiz = (n: number) => `${yoz(n)}%`

export const vaqt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
