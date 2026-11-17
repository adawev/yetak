// Lokal ishlash uchun: server/.env bo'lsa o'qiladi (u .gitignore da).
// Serverda muhit o'zgaruvchilari ishlatiladi. Boshqa importlardan oldin yuklanadi.
try {
  process.loadEnvFile();
} catch {
  /* .env yo'q — muhit o'zgaruvchilaridan */
}
