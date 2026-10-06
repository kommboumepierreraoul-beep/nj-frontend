import { cn } from "@/lib/utils";

/**
 * Barre de progression indéterminée d'un formulaire en modal pendant sa
 * soumission (§ 2.3 — retour visuel systématique). Un segment glisse en boucle
 * sur toute la largeur ; posée le long du filet bas de l'en-tête du modal
 * (`DialogFormHeader` la rend quand `pending` est vrai). Purement décorative :
 * l'annonce accessible se fait via `aria-busy` sur le conteneur du formulaire.
 *
 * `prefers-reduced-motion` : le segment ne glisse plus, il pulse en pleine
 * largeur (règle `.nj-form-bar-segment` dans globals.css).
 */
export function FormProgressBar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-[-1.5px] h-[3px] overflow-hidden bg-accent/15",
        className,
      )}
    >
      <div
        className="nj-form-bar-segment absolute inset-y-0 left-0 w-[30%] rounded-full bg-accent"
        style={{ animation: "njBarSlide 1.15s ease-in-out infinite" }}
      />
    </div>
  );
}
