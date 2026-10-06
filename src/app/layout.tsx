import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { PwaRegistration } from "@/components/pwa-registration";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NJ Global Trade",
  description: "Back-office NJ Global Trade — gestion commerciale, achats et facturation.",
  applicationName: "NJ Global Trade",
  themeColor: "#111111",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

// Script anti-flash : applique la classe `dark` avant le premier rendu, à partir
// du choix explicite persisté (`localStorage["nj.theme"]`, écrit par
// src/stores/ui.store.ts). Pas de suivi automatique de `prefers-color-scheme` —
// le thème reste une bascule manuelle (design system § 2.4), défaut clair.
const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem('nj.theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-dvh bg-background font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <PwaRegistration />
        {/* Icônes : lucide-react (composants React, aucune police externe à charger — voir src/config/nav-icons.tsx). */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
