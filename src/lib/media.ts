import { env } from "@/config/env";

/**
 * Origine du backend nj-backend (sans le suffixe `/api`), utilisée pour
 * résoudre les fichiers servis par le disque `public` de Laravel — voir
 * `config/filesystems.php` : `'url' => APP_URL . '/storage'`.
 *
 * `NEXT_PUBLIC_API_BASE_URL` vaut par ex. `http://localhost:8000/api` ;
 * `APP_URL` côté backend vaut `http://localhost:8000` (même hôte, sans le
 * préfixe `/api`) — d'où le simple retrait du suffixe plutôt qu'une variable
 * d'environnement dédiée.
 */
const API_ORIGIN = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Construit l'URL publique d'un fichier stocké sur le disque `public` du
 * backend à partir de son `file_path` relatif (ex.
 * `attachments/product/xxxx.jpg`, `categories/yyyy.png`).
 *
 * ⚠️ Correction d'un bug réel : `AttachmentResource::toArray()` et
 * `ProductCategoryResource::toArray()` (nj-backend) ne renvoient jamais
 * d'URL absolue, seulement `file_path`/`image_path` relatifs au disque
 * `public`. Le frontend avait supposé à tort l'existence d'un champ `url`
 * précalculé (`Attachment.url`) — inexistant côté API, d'où les visuels qui
 * ne s'affichaient jamais (galerie produit, vignettes de pièces jointes,
 * logos de catégorie). Toujours passer par cette fonction plutôt que
 * d'utiliser un champ `*_path` directement dans un `src`.
 */
export function storageUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${API_ORIGIN}/storage/${filePath.replace(/^\/+/, "")}`;
}
