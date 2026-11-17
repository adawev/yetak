// RAG korpusi: docs/ dagi tekshirilgan manbalardan src/korpus.generated.ts yasaydi.
// Serverga faqat dist/index.js yuboriladi, shuning uchun matn kodning ichiga joylanadi.
// Ishlatish: node scripts/korpus.mjs  (dev va build oldidan o'zi ishlaydi)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ildiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GITHUB = "https://github.com/adawev/yetak/blob/main/";

/** Korpusga kiradigan hujjatlar. `bolim` berilsa — faqat shu sarlavhadan keyingi sarlavhagacha. */
const HUJJATLAR = [
  { fayl: "docs/QOIDALAR.md", nom: "Yetak: kredit qoidalari jadvali" },
  {
    fayl: "docs/tadqiqot/02_kob_moliya_kredit.md",
    bolim: "### 1.2 Kredit olish",
    nom: "Yetak tadqiqoti: kichik biznes krediti",
  },
];

function bolimniOl(matn, sarlavha) {
  const boshi = matn.indexOf(sarlavha);
  if (boshi < 0) throw new Error(`Bo'lim topilmadi: ${sarlavha}`);
  const daraja = sarlavha.match(/^#+/)[0];
  const qolgan = matn.slice(boshi + sarlavha.length);
  const keyingi = qolgan.search(new RegExp(`\\n#{1,${daraja.length}} `));
  return (sarlavha + (keyingi < 0 ? qolgan : qolgan.slice(0, keyingi))).trim();
}

const korpus = HUJJATLAR.map((h) => {
  const toliq = readFileSync(join(ildiz, h.fayl), "utf8");
  const matn = h.bolim ? bolimniOl(toliq, h.bolim) : toliq.trim();
  return { nom: h.nom, url: GITHUB + h.fayl, matn };
});

const chiqish = join(ildiz, "server", "src", "korpus.generated.ts");
writeFileSync(
  chiqish,
  "// AVTOMATIK yaratilgan: server/scripts/korpus.mjs. Qo'lda tahrirlamang — docs/ ni tahrirlang.\n" +
    `export const KORPUS: { nom: string; url: string; matn: string }[] = ${JSON.stringify(korpus, null, 2)};\n`,
);
console.log(`korpus: ${korpus.length} hujjat, ${korpus.reduce((n, h) => n + h.matn.length, 0)} belgi`);
