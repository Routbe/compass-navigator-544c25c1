import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  AtSign,
  Braces,
  Building2,
  KeyRound,
  CornerDownLeft,
  Fingerprint,
  QrCode,
  ShieldCheck,
  TerminalSquare,
  Wallet,
  CreditCard,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { premiumSpringPreset } from "@/lib/spatial-motion";
import infrastructureImage from "@/assets/rout-infrastructure.jpg";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { useReveal } from "@/hooks/useReveal";
import { parseOmniInput, type OmniIntent } from "@/lib/omni-parser";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useTypingPlaceholder } from "@/hooks/useTypingPlaceholder";
import { GlowCard } from "@/components/gateway/BentoVisuals";
import { IdentityVisual, WalletVisual, CommerceVisual, RoutingVisual, IntegrationMesh, DataPaths } from "@/components/gateway/InfrastructureVisuals";

const TYPING_KEYS = ["gateway.typing.qr", "gateway.typing.handle", "gateway.typing.paste"] as const;

const ECOSYSTEM = [
  {
    Icon: KeyRound,
    key: "identity",
    to: "/developer/identity-oauth",
    Visual: IdentityVisual,
      },
  {
    Icon: Wallet,
    key: "wallet",
    to: "/info/wallet",
    Visual: WalletVisual,
      },
  {
    Icon: CreditCard,
    key: "commerce",
    to: "/solutions/creators",
    Visual: CommerceVisual,
      },
  { Icon: QrCode, key: "routing", to: "/qr", Visual: RoutingVisual },
] as const;

const PRINCIPLES = [
  { Icon: Fingerprint, text: "gateway.principle.identity" },
  { Icon: QrCode, text: "gateway.principle.routing" },
  { Icon: ShieldCheck, text: "gateway.principle.privacy" },
] as const;

const SUGGESTIONS = ["https://", "@handle", "/studio", "/dashboard"] as const;

function hintFor(intent: OmniIntent, t: (k: string, v?: Record<string, string>) => string): { icon: ReactNode; text: string } {
  switch (intent.kind) {
    case "url":
      return { icon: <QrCode className="h-3.5 w-3.5" />, text: t("gateway.hint.url", { host: new URL(intent.url).host }) };
    case "handle":
      return { icon: <AtSign className="h-3.5 w-3.5" />, text: t("gateway.hint.handle", { handle: intent.handle }) };
    case "command":
      return { icon: <TerminalSquare className="h-3.5 w-3.5" />, text: t("gateway.hint.command", { command: intent.command }) };
    case "unknown":
      return { icon: <TerminalSquare className="h-3.5 w-3.5" />, text: t("gateway.hint.unknown") };
    default:
      return { icon: <CornerDownLeft className="h-3.5 w-3.5" />, text: t("gateway.hint.enter") };
  }
}

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-visible={visible ? "true" : "false"} className={cn("omni-reveal", className)}>
      {children}
    </div>
  );
}

/**
 * `/` — de Sovereign Omni-Bar. Eén invoerveld routeert alles: een URL opent de
 * QR-generator in /studio, een @handle het profiel, een commando de juiste
 * module. Ingelogde leden worden al server-side naar /dashboard gestuurd (zie
 * de route-loader); dit effect vangt enkel client-side aanmeldingen op.
 */
export default function Gateway() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const typing = useMemo(() => ["rout.be/u/jona", "rout.be/w/maximilien", ...TYPING_KEYS.map((k) => t(k))], [t]);
  const nav = useNavigate();
  const [value, setValue] = useState("");
  const intent = useMemo(() => parseOmniInput(value), [value]);
  const hint = hintFor(intent, t);
  const typed = useTypingPlaceholder(typing, value.length > 0);

  useEffect(() => {
    if (!loading && user) nav("/dashboard", { replace: true });
  }, [user, loading, nav]);

  const submit = () => {
    if (intent.kind === "url" || intent.kind === "handle" || intent.kind === "command") {
      nav(intent.destination);
    }
  };

  return (
    <AppLayout width="full" revealFooter tone="infrastructure">
      <section className="infra-hero">
        <img src={infrastructureImage} alt="" width={1920} height={1024} fetchPriority="high" className="infra-hero-image" />
        <div className="infra-hero-content mx-auto flex max-w-6xl flex-col items-start px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t("gateway.kicker")}</p>
          <h1 className="infra-title mt-5 font-display text-4xl leading-[1.05] sm:text-6xl">
            ROUT
          </h1>
          <p className="mt-3 max-w-xl font-display text-2xl leading-tight sm:text-3xl">{t("infra.lead.title")}</p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t("infra.lead.text")}
          </p>

          <form
            className="omni-bar mt-7 w-full max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label htmlFor="omni-input" className="sr-only">
              {t("gateway.inputLabel")}
            </label>
            <div className="infra-command flex items-center gap-3 px-4 py-2">
              <span className="hidden shrink-0 font-mono text-xs text-primary sm:inline" aria-hidden>{t("infra.prefix")} $</span>
              <TerminalSquare className="h-4 w-4 shrink-0 text-primary sm:hidden" aria-hidden />
              <input
                id="omni-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={typed || t("gateway.inputPlaceholder")}
                aria-description={t("gateway.inputPlaceholder")}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="go"
                className="h-10 min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                className="infra-action h-10 w-10 shrink-0"
                disabled={intent.kind === "empty" || intent.kind === "unknown"}
                aria-label={t("gateway.submit")}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 flex min-h-5 items-center gap-1.5 font-mono text-[11px] text-muted-foreground" aria-live="polite">
              {hint.icon}
              {hint.text}
            </p>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Button variant="ghost" size="sm"
                key={s}
                type="button"
                onClick={() => {
                  setValue(s === "@handle" ? "@" : s);
                  document.getElementById("omni-input")?.focus();
                }}
                className="h-7 px-2 font-mono text-[11px] text-muted-foreground"
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="mt-6 flex w-full max-w-xl flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <motion.div whileTap={reduced ? undefined : { scale: 0.96 }} transition={premiumSpringPreset}><Button asChild size="lg" className="infra-action h-12 w-full gap-2 px-6 text-sm">
              <Link to="/auth">
                <Fingerprint className="h-4 w-4" /> {t("gateway.claim")}
              </Link>
            </Button></motion.div>
            <motion.div whileTap={reduced ? undefined : { scale: 0.96 }} transition={premiumSpringPreset}><Button
              size="lg"
              variant="outline"
              className="infra-action h-12 w-full gap-2 px-6 text-sm"
              onClick={() => document.getElementById("ecosystem")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" })}
            >
              {t("gateway.explore")} <ArrowRight className="h-4 w-4" />
            </Button></motion.div>
          </div>
          <Button variant="ghost" size="sm"
            type="button"
            onClick={() => window.dispatchEvent(new Event("rout:command-palette"))}
            className="mt-4 hidden h-7 items-center gap-1.5 p-0 text-xs text-muted-foreground sm:inline-flex"
          >
            {t("gateway.palette")} <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </Button>
        </div>
      </section>

      <div id="ecosystem" className="infra-ecosystem mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 pt-12 sm:px-6 sm:pb-24">
        <Reveal className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("gateway.eco.kicker")}</p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            {t("infra.eco.title")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("infra.eco.lead")}
          </p>
        </Reveal>

        <DataPaths />
        <Reveal className="grid gap-4 md:grid-cols-2">
          {ECOSYSTEM.map(({ Icon, key, to, Visual }) => (
            <GlowCard key={key} className="acrylic-card infra-pillar">
              <div className="flex h-full flex-col p-6">
                <div className="infra-visual mb-6 flex items-center justify-center">
                  <Visual />
                </div>
                <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden /> {key.toUpperCase()} / ROUT
                </span>
                <h3 className="mt-4 font-display text-2xl text-foreground">{t(`infra.${key}.title`)}</h3>
                <p className="mt-3 flex-1 font-mono text-xs leading-relaxed text-muted-foreground">{t(`infra.${key}.text`)}</p>
                <Link to={to} className="group mt-5 inline-flex items-center gap-1.5 text-sm text-foreground">
                  {t(`infra.${key}.cta`)} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </GlowCard>
          ))}
        </Reveal>

        <Reveal className="mt-8 grid gap-6 border-y border-border py-7 sm:grid-cols-2">
          {[{ key: "workspace", Icon: Building2, to: "/support/workspace/getting-started/what-is-a-workspace" }, { key: "api", Icon: Braces, to: "/developers" }].map(({ key, Icon, to }) => <Link key={key} to={to} className="flex items-center gap-4"><Icon className="h-5 w-5 shrink-0 text-primary" /><span><span className="block font-display text-xl">{t(`infra.${key}.title`)}</span><span className="mt-1 block font-mono text-xs text-muted-foreground">{t(`infra.${key}.text`)}</span></span><ArrowRight className="ml-auto h-4 w-4 shrink-0" /></Link>)}
        </Reveal>
        <IntegrationMesh />

        <Reveal className="mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          {PRINCIPLES.map(({ Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-foreground" aria-hidden /> {t(text)}
            </span>
          ))}
        </Reveal>

        <Reveal className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/explore" className="underline-offset-4 hover:text-foreground hover:underline">
            {t("gateway.link.explore")}
          </Link>
          <Link to="/product" className="underline-offset-4 hover:text-foreground hover:underline">
            {t("gateway.link.platform")}
          </Link>
          <Link to="/developers" className="underline-offset-4 hover:text-foreground hover:underline">
            {t("gateway.link.developers")}
          </Link>
          <Link to="/about" className="underline-offset-4 hover:text-foreground hover:underline">
            {t("gateway.link.about")}
          </Link>
          <Link to="/auth/sign-in" className="underline-offset-4 hover:text-foreground hover:underline">
            {t("gateway.link.signIn")}
          </Link>
        </Reveal>
      </div>
    </AppLayout>
  );
}
