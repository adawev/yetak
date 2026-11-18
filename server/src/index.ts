import "./env";
import { serve } from "@hono/node-server";
import { ClaudeAgent } from "./agent";
import { appYaratish } from "./app";
import { config } from "./config";
import { FaylStore } from "./store";

const store = new FaylStore(config.dataDir, config.saqlashKun);
const agent = config.kalitBor() ? new ClaudeAgent() : null;
if (!agent) console.warn("ANTHROPIC_API_KEY yo'q: xabar yuborish 503 qaytaradi.");

const app = appYaratish({ store, agent, corsOrigin: config.corsOrigin });

serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (i) => {
  console.log(`Yetak server: http://${config.host}:${i.port} (model ${config.model})`);
});
