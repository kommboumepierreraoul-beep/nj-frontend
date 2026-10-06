import { z } from "zod";

/**
 * Toutes les variables lues côté client doivent être préfixées `NEXT_PUBLIC_`
 * (Next.js ne les inline dans le bundle qu'à cette condition). Le token
 * vivant en localStorage (choix assumé, voir § Authentification du document
 * d'architecture), l'API est appelée directement depuis le navigateur : il
 * n'y a pas de secret serveur à isoler ici.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url("NEXT_PUBLIC_API_BASE_URL doit être une URL absolue, ex. http://localhost:8000/api"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL doit être une URL absolue, ex. http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("NJ Global Trade"),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(
      `Configuration invalide : variables d'environnement manquantes ou incorrectes.\n${details}\n` +
        "Copiez .env.local.example vers .env.local puis renseignez les valeurs.",
    );
  }

  return parsed.data;
}

export const env = loadEnv();
