// Bank logotiplari: brauzer bank saytining belgisini favicon xizmatidan oladi.
// Ochilmasa — bank rangidagi harf belgisi (BankLogo komponentida).

interface BankBelgi {
  domen: string
  harf: string
  rang: string
}

const BANKLAR: { mos: RegExp; belgi: BankBelgi }[] = [
  { mos: /tbc/i, belgi: { domen: 'tbcbank.uz', harf: 'T', rang: '#00a3e0' } },
  { mos: /hamkor/i, belgi: { domen: 'hamkorbank.uz', harf: 'H', rang: '#d71920' } },
  { mos: /sqb|sanoat/i, belgi: { domen: 'sqb.uz', harf: 'S', rang: '#0b4ea2' } },
  { mos: /ipak/i, belgi: { domen: 'ipakyulibank.uz', harf: 'I', rang: '#0f8a5f' } },
  { mos: /mikrokredit|mkbank/i, belgi: { domen: 'mkbank.uz', harf: 'M', rang: '#1b6fb8' } },
  { mos: /kapital/i, belgi: { domen: 'kapitalbank.uz', harf: 'K', rang: '#e30613' } },
]

export function bankBelgisi(bank: string): BankBelgi & { logo: string | null } {
  const b = BANKLAR.find((x) => x.mos.test(bank))?.belgi
  if (!b) return { domen: '', harf: bank.trim().charAt(0).toUpperCase() || '?', rang: '#5b6475', logo: null }
  return { ...b, logo: `https://www.google.com/s2/favicons?domain=${b.domen}&sz=128` }
}
