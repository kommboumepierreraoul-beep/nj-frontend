"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WHATS_NEW_RELEASE, WHATS_NEW_STEPS, WHATS_NEW_STORAGE_KEY } from "@/config/whats-new";
import { translate } from "@/i18n/translate";
import { cn } from "@/lib/utils";

function readSeen(): string | null {
  try {
    return localStorage.getItem(WHATS_NEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

function markSeen() {
  try {
    localStorage.setItem(WHATS_NEW_STORAGE_KEY, WHATS_NEW_RELEASE);
  } catch {
    /* localStorage indisponible — le guide se rouvrira au prochain chargement. */
  }
}

/**
 * Une seule instance, montée par `AppShell`. S'ouvre :
 *  - toute seule à la première visite (`localStorage[nj.whatsNew] !== WHATS_NEW_RELEASE`) ;
 *  - à la demande quand `openSignal` change (bouton « Nouveautés » de l'en-tête).
 */
export function WhatsNewModal({ openSignal = 0 }: { openSignal?: number } = {}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Lecture localStorage post-montage (jamais au SSR) → première visite.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (readSeen() !== WHATS_NEW_RELEASE) setOpen(true);
  }, []);

  // Rouverture explicite depuis l'en-tête (openSignal incrémenté à chaque clic).
  const [lastSignal, setLastSignal] = useState(0);
  if (openSignal !== lastSignal) {
    setLastSignal(openSignal);
    if (openSignal > 0) {
      setStep(0);
      setOpen(true);
    }
  }

  const close = useCallback(() => {
    markSeen();
    setStep(0);
    setOpen(false);
  }, []);

  const total = WHATS_NEW_STEPS.length;
  const current = WHATS_NEW_STEPS[Math.min(step, total - 1)];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step >= total - 1;
  const isNew = current.since === WHATS_NEW_RELEASE;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.3)] sm:max-w-[520px]">
        <DialogTitle className="sr-only">{translate("whatsNew.dialogTitle")}</DialogTitle>
        <DialogDescription className="sr-only">{translate("whatsNew.dialogDesc")}</DialogDescription>

        {/* En-tête : puce « Nouveautés » + fermeture */}
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="flex items-center gap-2 rounded-full bg-accent-bg px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-link">
            <Sparkles className="h-3.5 w-3.5" />
            {translate("whatsNew.badge")}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={translate("action.close")}
            className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-background text-muted-foreground hover:bg-border hover:text-foreground"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Zone visuelle */}
        <div className="px-6 pt-5">
          <div className="flex h-[140px] items-center justify-center rounded-2xl bg-accent-bg">
            <Icon className="h-14 w-14 text-link" strokeWidth={1.6} />
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-foreground text-pretty">
              {translate(current.titleKey)}
            </h2>
            {isNew ? (
              <span className="shrink-0 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-success">
                {translate("whatsNew.new")}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[13px] leading-[1.6] text-muted-foreground text-pretty">
            {translate(current.bodyKey)}
          </p>
        </div>

        {/* Progression + navigation */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <div className="flex items-center gap-1.5">
            {WHATS_NEW_STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-5 bg-accent" : "w-1.5 bg-border-2",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isFirst ? (
              <button
                type="button"
                onClick={close}
                className="h-9 rounded-[9px] px-3 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
              >
                {translate("whatsNew.skip")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="flex h-9 items-center gap-1 rounded-[9px] border-[1.5px] border-border px-3 text-[12.5px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {translate("whatsNew.prev")}
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                onClick={close}
                className="flex h-9 items-center gap-1.5 rounded-[9px] bg-accent px-4 text-[12.5px] font-bold text-accent-foreground hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                {translate("whatsNew.done")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                className="flex h-9 items-center gap-1.5 rounded-[9px] bg-accent px-4 text-[12.5px] font-bold text-accent-foreground hover:opacity-90"
              >
                {translate("whatsNew.next")}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** `true` s'il existe des nouveautés non encore vues sur cet appareil. */
export function useHasUnseenWhatsNew(): boolean {
  const [unseen, setUnseen] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnseen(readSeen() !== WHATS_NEW_RELEASE);
  }, []);
  return unseen;
}
