import { Check, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { BOSH_SAHIFA, joriySessiya, useAuth } from "@/lib/auth";

const maydon =
  "mt-1 block min-h-12 w-full rounded-xl border border-border bg-card px-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function Kirish({ royxat = false }: { royxat?: boolean }) {
  const { f, kirdi } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [ism, setIsm] = useState("");
  const [telefon, setTelefon] = useState("");
  const [parol, setParol] = useState("");
  const [xato, setXato] = useState<string | null>(null);
  const [band, setBand] = useState(false);

  if (f) return <Navigate to={BOSH_SAHIFA[f.rol]} replace />;

  const yubor = async (e: FormEvent) => {
    e.preventDefault();
    setXato(null);
    setBand(true);
    try {
      const sessiya_id = joriySessiya();
      const j = royxat
        ? await api.royxat({ ism, telefon, parol, sessiya_id })
        : await api.kirish({ telefon, parol, sessiya_id });
      await kirdi(j);
      const keyin = params.get("next");
      nav(keyin?.startsWith("/") ? keyin : BOSH_SAHIFA[j.foydalanuvchi.rol], {
        replace: true,
      });
    } catch (e) {
      setXato(e instanceof Error ? e.message : "Nimadir xato ketdi.");
    } finally {
      setBand(false);
    }
  };

  return (
    <main className="grid h-full overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Chap panel: kim nima oladi */}
      <aside className="hidden border-r border-border bg-surface p-12 lg:flex lg:flex-col lg:justify-between">
        <span />
        <div>
          <h2 className="max-w-md text-4xl leading-tight font-semibold">
            {royxat ? "Yo'lingiz saqlanadi" : 'Bitta oyna, uch tomon'}
          </h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {(royxat
              ? [
                  "Suhbat va yo'l xaritangiz har qurilmada",
                  "Bajarilgan qadamlar belgilanib boradi",
                  "Tadbirkor uchun 0 so'm",
                ]
              : [
                  "Tadbirkor — o'z suhbati va yo'l xaritasi",
                  "Bank xodimi — tekshirilgan, rozilik bergan arizalar",
                  "Admin — hamkor banklar va hisobot",
                ]
            ).map((x) => (
              <li key={x} className="flex gap-3 py-3.5">
                <Check size={18} className="mt-0.5 shrink-0 text-success" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Roziligingizsiz ma'lumotingiz hech bir bankka bormaydi.
        </p>
      </aside>

      <div className="flex items-start justify-center p-4 sm:items-center sm:p-8">
        <form
          onSubmit={yubor}
          className="mt-6 w-full max-w-sm space-y-5 sm:mt-0"
        >
          <div>
            <h1 className="text-3xl font-semibold">
              {royxat ? "Ro'yxatdan o'tish" : "Xush kelibsiz"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {royxat
                ? "Suhbatingiz va yo'l xaritangiz saqlanadi — boshqa qurilmadan ham davom ettirasiz."
                : "Tadbirkor, bank xodimi yoki admin — bitta oyna."}
            </p>
          </div>

          {royxat && (
            <label className="block text-sm font-medium">
              Ismingiz
              <input
                className={maydon}
                value={ism}
                onChange={(e) => setIsm(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label className="block text-sm font-medium">
            Telefon raqam
            <span className="relative mt-1 block">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-muted-foreground">
                +998
              </span>
              <input
                className={`${maydon} mt-0 pl-14`}
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="90 123 45 67"
                required
              />
            </span>
          </label>
          <label className="block text-sm font-medium">
            Parol
            <input
              className={maydon}
              type="password"
              value={parol}
              onChange={(e) => setParol(e.target.value)}
              autoComplete={royxat ? "new-password" : "current-password"}
              minLength={6}
              required
            />
            {royxat && (
              <span className="mt-1 block text-xs text-muted-foreground">
                Kamida 6 belgi
              </span>
            )}
          </label>

          {xato && (
            <p className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
              {xato}
            </p>
          )}

          <button
            type="submit"
            disabled={band}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-foreground font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {band && <Loader2 size={16} className="animate-spin" />}
            {royxat ? "Ro'yxatdan o'tish" : "Kirish"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {royxat ? (
              <>
                Akkauntingiz bormi?{" "}
                <Link
                  to="/login"
                  className="font-medium text-foreground underline"
                >
                  Kirish
                </Link>
              </>
            ) : (
              <>
                Tadbirkormisiz?{" "}
                <Link
                  to="/register"
                  className="font-medium text-foreground underline"
                >
                  Ro'yxatdan o'ting
                </Link>
              </>
            )}
          </p>
          {royxat && (
            <p className="text-center text-xs text-muted-foreground">
              Yetak tadbirkor uchun bepul. Ro'yxatdan o'tish ixtiyoriy.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
