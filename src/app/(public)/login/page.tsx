import type { Metadata } from "next";
import { LoginScreen } from "@/modules/auth/components/login-screen";

export const metadata: Metadata = { title: "Connexion — NJ Global Trade" };

/**
 * Calquée sur NJ Global Trade Login.dc.html (lignes 54-200) : grille deux
 * colonnes (panneau de marque / panneau de connexion). Le rendu réel vit dans
 * LoginScreen (composant client) pour que le sélecteur de langue soit
 * fonctionnel (bascule FR/EN) ; cette page ne garde que les métadonnées.
 */
export default function LoginPage() {
  return <LoginScreen />;
}
