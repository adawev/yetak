// Sozlamalar faqat muhit o'zgaruvchilaridan. Kalit kodda yoki log'da turmaydi.

const son = (qiymat: string | undefined, standart: number) => {
  const n = Number(qiymat);
  return Number.isFinite(n) && n > 0 ? n : standart;
};

export const config = {
  port: son(process.env.PORT, 8787),
  host: process.env.HOST ?? "127.0.0.1",
  dataDir: process.env.DATA_DIR ?? "./data",
  /** Vergul bilan: "https://yetak.netlify.app,http://localhost:5173". Bo'sh bo'lsa — hamma. */
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  model: process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5",
  /** Shuncha kun ishlatilmagan sessiya o'chiriladi (keraksiz ma'lumot saqlanmaydi). */
  saqlashKun: son(process.env.SAQLASH_KUN, 30),
  /** Birinchi admin (faqat admin yo'q bo'lsa yaratiladi). Parol faqat server/.env da. */
  adminTelefon: process.env.ADMIN_TELEFON,
  adminParol: process.env.ADMIN_PAROL,
  kalitBor: () => Boolean(process.env.ANTHROPIC_API_KEY),
};
