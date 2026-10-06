import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité — NJ Global Trade",
  description: "Politique de confidentialité de la plateforme NJ Global Trade.",
};

const sections = [
  {
    title: "1. Responsable du traitement",
    content: (
      <>
        <p>NJ Global Trade Co., Ltd. est responsable du traitement des données collectées via la plateforme NJ Global Trade.</p>
        <p>Adresse de contact : <a href="mailto:contact@njglobaltrade.com" className="text-link hover:underline">contact@njglobaltrade.com</a>.</p>
        <p>La plateforme est destinée à la gestion des activités commerciales, des achats, des ventes et des opérations administratives de l’entreprise.</p>
      </>
    ),
  },
  {
    title: "2. Données collectées",
    content: (
      <>
        <p>Selon votre utilisation de la plateforme, nous pouvons traiter :</p>
        <ul>
          <li><strong>Compte utilisateur :</strong> nom, adresse email, rôle, permissions, statut du compte et méthode de connexion.</li>
          <li><strong>Authentification :</strong> identifiants techniques, jetons de session, historique de connexion et informations fournies par Google lorsque vous utilisez Google OAuth.</li>
          <li><strong>Données commerciales :</strong> clients, fournisseurs, contacts, produits, variantes, demandes de prix, commandes, factures, paiements, devises et tarifs de transport.</li>
          <li><strong>Documents et fichiers :</strong> pièces jointes, logos, documents commerciaux et informations figurant dans les fichiers téléversés.</li>
          <li><strong>Notifications et activité :</strong> notifications internes, préférences de notification, traces d’audit et événements nécessaires à la sécurité.</li>
          <li><strong>Données techniques :</strong> informations nécessaires au fonctionnement, à la sécurité, au diagnostic et à la prévention des abus.</li>
        </ul>
        <p>Nous ne demandons pas de données sensibles pour utiliser les fonctions normales de la plateforme. Évitez d’insérer de telles données dans les champs libres ou les pièces jointes.</p>
      </>
    ),
  },
  {
    title: "3. Finalités et bases d’utilisation",
    content: (
      <>
        <p>Les données sont utilisées pour :</p>
        <ul>
          <li>créer, administrer et sécuriser les comptes utilisateurs ;</li>
          <li>fournir les fonctions de gestion commerciale et documentaire ;</li>
          <li>générer les devis, proformas, factures, avoirs, reçus et rapports ;</li>
          <li>envoyer les invitations, liens de réinitialisation et notifications demandées ;</li>
          <li>gérer les permissions, les préférences et les sessions ;</li>
          <li>détecter les erreurs, les connexions anormales et les abus ;</li>
          <li>conserver les preuves nécessaires à la traçabilité des opérations et au respect des obligations applicables.</li>
        </ul>
        <p>Les traitements reposent selon les cas sur l’exécution du service demandé, la gestion de la relation professionnelle, les obligations légales, la sécurité du service ou votre consentement lorsqu’il est requis.</p>
      </>
    ),
  },
  {
    title: "4. Partage et prestataires",
    content: (
      <>
        <p>Les données sont accessibles uniquement aux utilisateurs autorisés selon leur rôle et leurs permissions. Elles peuvent être traitées par les prestataires techniques nécessaires au fonctionnement de la plateforme :</p>
        <ul>
          <li><strong>Neon :</strong> hébergement de la base de données PostgreSQL ;</li>
          <li><strong>Render :</strong> hébergement et exécution de l’API backend ;</li>
          <li><strong>Vercel :</strong> hébergement de l’interface frontend ;</li>
          <li><strong>Brevo :</strong> envoi des emails transactionnels et, lorsque configuré, des communications prévues par l’application ;</li>
          <li><strong>Google :</strong> authentification Google OAuth lorsque vous choisissez cette méthode de connexion.</li>
        </ul>
        <p>Ces prestataires agissent dans le cadre de leurs services et peuvent traiter certaines données depuis des pays différents de votre pays de résidence. Nous ne vendons pas les données personnelles.</p>
      </>
    ),
  },
  {
    title: "5. Conservation",
    content: (
      <>
        <p>Les données de compte et les données commerciales sont conservées pendant la durée nécessaire à la gestion de la relation professionnelle, puis pendant les durées imposées ou permises par les obligations légales et la défense des droits.</p>
        <p>Les jetons de réinitialisation expirent après 60 minutes. Les sessions inactives expirent après 120 minutes. Les jetons d’accès sont renouvelés lors de l’utilisation et expirent après une période maximale configurée de 30 jours sans activité.</p>
        <p>Les journaux d’audit et de sécurité peuvent être conservés plus longtemps lorsque cela est nécessaire pour établir, exercer ou défendre un droit.</p>
      </>
    ),
  },
  {
    title: "6. Sécurité",
    content: (
      <>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles adaptées : contrôle d’accès par rôles et permissions, limitation des tentatives de connexion, verrouillage temporaire après plusieurs échecs, chiffrement des communications via HTTPS, hachage des mots de passe, expiration des jetons et journalisation des opérations sensibles.</p>
        <p>Aucun service en ligne ne peut toutefois garantir une sécurité absolue. En cas de suspicion d’accès non autorisé, contactez immédiatement l’administrateur de votre organisation.</p>
      </>
    ),
  },
  {
    title: "7. Cookies et stockage local",
    content: (
      <>
        <p>L’interface utilise le stockage local du navigateur pour conserver la session d’authentification, les préférences de thème et la langue. Ces éléments sont nécessaires au fonctionnement de l’application.</p>
        <p>Vous pouvez les supprimer depuis les réglages de votre navigateur, mais cela vous déconnectera et réinitialisera certaines préférences. La plateforme n’utilise pas de cookies publicitaires pour suivre votre activité à des fins commerciales.</p>
      </>
    ),
  },
  {
    title: "8. Vos droits",
    content: (
      <>
        <p>Selon la réglementation applicable, vous pouvez demander l’accès, la rectification, la suppression, la limitation ou la portabilité de vos données, ainsi que vous opposer à certains traitements ou retirer un consentement lorsque le traitement repose sur celui-ci.</p>
        <p>Pour exercer vos droits, écrivez à <a href="mailto:contact@njglobaltrade.com" className="text-link hover:underline">contact@njglobaltrade.com</a> en indiquant votre identité, votre organisation et l’objet de la demande. Nous pouvons demander une vérification d’identité avant de traiter la demande.</p>
        <p>Vous pouvez également introduire une réclamation auprès de l’autorité de protection des données compétente dans votre pays.</p>
      </>
    ),
  },
  {
    title: "9. Mineurs",
    content: <p>La plateforme est un outil professionnel et n’est pas destinée aux personnes qui n’ont pas l’âge légal requis pour utiliser ce type de service.</p>,
  },
  {
    title: "10. Modifications",
    content: <p>Cette politique peut être mise à jour pour refléter l’évolution de la plateforme, des prestataires ou des obligations applicables. La date de dernière mise à jour est indiquée ci-dessous. En cas de changement important, une information pourra être affichée dans l’application ou envoyée aux administrateurs.</p>,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>
          <span className="hidden items-center gap-2 text-xs font-semibold text-text-tertiary sm:flex">
            <ShieldCheck className="h-4 w-4 text-accent" /> NJ Global Trade
          </span>
        </div>

        <article className="overflow-hidden rounded-[18px] border border-border bg-surface shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
          <header className="border-b border-border bg-[#111111] px-6 py-8 text-white sm:px-10 sm:py-10">
            <img src="/logo.png" alt="NJ Global Trade Co. Ltd" className="mb-7 h-9 w-auto rounded bg-white px-2 py-1" />
            <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#e5a817] uppercase">Document légal</p>
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Politique de confidentialité</h1>
            <p className="mt-4 max-w-[650px] text-sm leading-6 text-white/70">Cette politique explique quelles données sont utilisées par la plateforme NJ Global Trade, pourquoi elles le sont et quels sont vos droits.</p>
          </header>

          <div className="space-y-8 px-6 py-8 text-[14px] leading-7 text-muted-foreground sm:px-10 sm:py-10">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-bold tracking-[-0.01em] text-foreground">{section.title}</h2>
                <div className="space-y-3 [&_li]:ml-5 [&_li]:list-disc [&_p]:m-0">{section.content}</div>
              </section>
            ))}
            <div className="border-t border-border pt-6 text-xs text-text-tertiary">
              Dernière mise à jour : 6 octobre 2026
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
