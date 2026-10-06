import { LayoutDashboard, Receipt, Truck, type LucideIcon } from "lucide-react";

/**
 * Panneau de marque (moitié gauche) de la page de connexion, calqué sur
 * NJ Global Trade Login.dc.html (lignes 56-115). Reprend telles quelles les
 * animations de fond (dérive des halos, balayage lumineux, grille de points)
 * et le contenu fourni par le template (texte des 3 points forts, chiffres de
 * la barre de stats).
 *
 * Simplification assumée : le halo doré qui suit la souris (composant
 * `Component` du template, `componentDidMount`/pointermove) n'est pas
 * reproduit — effet purement décoratif nécessitant du JS client pour un gain
 * visuel marginal par rapport aux 3 halos statiques déjà animés en CSS.
 *
 * Les chiffres de la barre de stats (« 12 ans », « 480+ », « 96 % ») et les
 * points forts viennent du contenu du template lui-même, pas d'une donnée
 * réelle NJ Global Trade — à confirmer avec le client avant mise en
 * production.
 */
const FEATURES: {
  icon: LucideIcon;
  title: string;
  points: string[];
  dotFill: string;
  pulse: boolean;
  delay: string;
  isLast?: boolean;
}[] = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord détaillé",
    points: [
      "Indicateurs de performance à jour, visibles en tout temps",
      "Vue d'ensemble du système en un écran",
    ],
    dotFill: "#E5A817",
    pulse: true,
    delay: "260ms",
  },
  {
    icon: Receipt,
    title: "Factures générées automatiquement",
    points: ["Des proformas claires et adaptées aux besoins du client"],
    dotFill: "rgba(255,255,255,0.8)",
    pulse: false,
    delay: "370ms",
  },
  {
    icon: Truck,
    title: "Suivi des expéditions Chine → Afrique",
    points: ["Statut douane et livraison mis à jour en temps réel"],
    dotFill: "rgba(255,255,255,0.8)",
    pulse: false,
    delay: "480ms",
    isLast: true,
  },
];

const STATS = [
  { value: "12 ans", label: "PRÉSENCE EN CHINE" },
  { value: "480+", label: "FOURNISSEURS VÉRIFIÉS" },
  { value: "96 %", label: "TAUX DE LIVRAISON" },
];

export function LoginBrandPanel() {
  return (
    <section
      className="relative isolate hidden flex-col overflow-hidden px-16 pb-14 pt-12 lg:flex"
      style={{ background: "linear-gradient(160deg, #FBFAF7 0%, #F8F7F3 60%, #FAF9F6 100%)" }}
    >
      <div className="pointer-events-none absolute inset-[-12%] z-0" style={{ filter: "blur(76px)", opacity: 0.62 }}>
        <div
          className="absolute rounded-full"
          style={{
            top: "4%",
            left: "-4%",
            width: "46%",
            height: "52%",
            background: "radial-gradient(circle at 40% 40%, rgba(229,168,23,0.55), rgba(229,168,23,0) 70%)",
            animation: "njDrift1 17s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "32%",
            left: "34%",
            width: "52%",
            height: "56%",
            background: "radial-gradient(circle at 50% 50%, rgba(122,110,255,0.30), rgba(122,110,255,0) 70%)",
            animation: "njDrift2 21s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "54%",
            left: "2%",
            width: "44%",
            height: "46%",
            background: "radial-gradient(circle at 50% 50%, rgba(64,208,196,0.26), rgba(64,208,196,0) 70%)",
            animation: "njDrift3 25s ease-in-out infinite",
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute left-[12%] top-0 h-[42%] w-[130%]"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 100%)",
            filter: "blur(26px)",
            animation: "njSweep 11s linear infinite",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(17,17,17,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(120% 90% at 20% 15%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 20% 15%, #000 20%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col gap-11">
        <img
          src="/logo.png"
          alt="NJ Global Trade Co. Ltd"
          className="h-[46px] w-auto flex-none self-start"
          style={{ animation: "njRise 700ms cubic-bezier(.2,.7,.2,1) both" }}
        />

        <div
          className="flex max-w-[520px] flex-col gap-[18px]"
          style={{ animation: "njRise 700ms cubic-bezier(.2,.7,.2,1) 90ms both" }}
        >
          <h1 className="m-0 text-[46px] font-extrabold leading-[1.08] tracking-[-0.035em] text-foreground text-pretty">
            Un contrôle total sur toute votre activité
          </h1>
          <p className="m-0 text-[17px] font-semibold leading-[1.5] tracking-[-0.01em]" style={{ color: "#444444" }}>
            Gérez tous les axes de votre entreprise depuis une seule plateforme.
          </p>
        </div>

        <div className="flex max-w-[560px] flex-col">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-[22px] transition-transform duration-200 hover:translate-x-1.5"
              style={{ animation: `njRise 700ms cubic-bezier(.2,.7,.2,1) ${feature.delay} both` }}
            >
              <div className="flex w-[14px] shrink-0 flex-col items-center">
                <div
                  className="mt-[5px] h-[14px] w-[14px] shrink-0 rounded-full border-[2.5px] border-accent"
                  style={{
                    background: feature.dotFill,
                    animation: feature.pulse ? "njPulse 2.8s ease-out infinite" : undefined,
                  }}
                />
                <div className="w-[2px] flex-1 bg-accent" style={{ opacity: feature.isLast ? 0 : 1 }} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5 pb-[30px]">
                <div className="flex items-center gap-2.5">
                  <feature.icon className="h-[21px] w-[21px] text-foreground" aria-hidden />
                  <div className="text-[19px] font-bold leading-[1.3] tracking-[-0.02em] text-foreground">
                    {feature.title}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {feature.points.map((point) => (
                    <div key={point} className="text-[14px] leading-[1.5] text-pretty" style={{ color: "#666666" }}>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <div
          className="flex items-center gap-8 rounded-[14px] border px-6 py-[18px] backdrop-blur-[14px] transition-all duration-200 hover:-translate-y-[3px]"
          style={{
            borderColor: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.55)",
            boxShadow: "0 8px 32px rgba(17,17,17,0.06)",
            animation: "njRise 700ms cubic-bezier(.2,.7,.2,1) 420ms both",
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-[3px]">
              <div className="text-[20px] font-extrabold tracking-[-0.02em] text-foreground">{stat.value}</div>
              <div className="text-[9.5px] font-semibold tracking-[0.14em] text-text-tertiary">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
