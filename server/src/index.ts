import "./env";
import { join } from "node:path";
import { serve } from "@hono/node-server";
import { ClaudeAgent } from "./agent";
import { appYaratish } from "./app";
import { config } from "./config";
import { DiskFaylOmbor, FaylStore } from "./store";
import { ClaudeTekshiruvchi } from "./tekshiruv";

const store = new FaylStore(config.dataDir, config.saqlashKun);
const fayllar = new DiskFaylOmbor(join(config.dataDir, "fayllar"));
// Muddati o'tgan sessiyalarning hujjatlari ham o'chadi.
fayllar.tozala(new Set(store.hammasi().map((s) => s.id)));
const agent = config.kalitBor() ? new ClaudeAgent() : null;
const tekshiruvchi = config.kalitBor() ? new ClaudeTekshiruvchi() : null;
if (!agent) console.warn("ANTHROPIC_API_KEY yo'q: xabar yuborish 503 qaytaradi, hujjatlar tekshirilmaydi.");

const app = appYaratish({ store, agent, corsOrigin: config.corsOrigin, fayllar, tekshiruvchi });

serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (i) => {
  console.log(`Yetak server: http://${config.host}:${i.port} (model ${config.model})`);
});
