// Sinov uchun soxta hujjat PDF yasaydi (haqiqiy shaxs emas). Ishlatish: node scripts/namuna-hujjat.mjs <chiqish.pdf> <ism> <sarlavha>
import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts } from "pdf-lib";

const [chiqish, ism = "Namunov Sinov", sarlavha = "KREDIT TARIXI HAQIDA MA'LUMOTNOMA"] = process.argv.slice(2);
const doc = await PDFDocument.create();
const f = await doc.embedFont(StandardFonts.Helvetica);
const b = await doc.embedFont(StandardFonts.HelveticaBold);
const p = doc.addPage([595, 842]);
const qator = (t, y, s = 11, font = f) => p.drawText(t, { x: 60, y, size: s, font });
qator("Kredit-axborot tahliliy markazi (KATM) - NAMUNA, SINOV UCHUN", 790, 9);
qator(sarlavha, 750, 16, b);
qator(`F.I.Sh.: ${ism}`, 710);
qator("JShShIR: 00000000000000 (namuna)", 690);
qator(`Sana: ${new Date().toISOString().slice(0, 10)}`, 670);
qator("Faol kreditlar: yo'q", 640);
qator("Muddati o'tgan qarzlar: yo'q", 620);
qator("Oxirgi 24 oyda kechikishlar: yo'q", 600);
writeFileSync(chiqish, await doc.save());
console.log("yozildi:", chiqish);
