"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, MousePointerClick, X } from "lucide-react";
import type { TourPlacement, TourStep } from "@/config/tours";
import { translate } from "@/i18n/translate";
import { cn } from "@/lib/utils";

const SPOT_PADDING = 8;
const CARD_WIDTH = 340;
const GAP = 16;
const RESOLVE_TIMEOUT_MS = 3000;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/** Choisit un placement de carte qui tient dans le viewport. */
function resolvePlacement(box: Box, preferred: TourPlacement): Exclude<TourPlacement, "auto"> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const order: Exclude<TourPlacement, "auto">[] =
    preferred === "auto" ? ["bottom", "top", "right", "left"] : [preferred, "bottom", "top", "right", "left"];
  for (const p of order) {
    if (p === "bottom" && vh - (box.top + box.height) >= 180) return "bottom";
    if (p === "top" && box.top >= 180) return "top";
    if (p === "right" && vw - (box.left + box.width) >= CARD_WIDTH + GAP) return "right";
    if (p === "left" && box.left >= CARD_WIDTH + GAP) return "left";
  }
  return "bottom";
}

function cardPosition(box: Box, placement: Exclude<TourPlacement, "auto">) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top: number;
  let left: number;
  if (placement === "bottom") {
    top = box.top + box.height + GAP;
    left = box.left + box.width / 2 - CARD_WIDTH / 2;
  } else if (placement === "top") {
    top = box.top - GAP - 8;
    left = box.left + box.width / 2 - CARD_WIDTH / 2;
  } else if (placement === "right") {
    top = box.top;
    left = box.left + box.width + GAP;
  } else {
    top = box.top;
    left = box.left - CARD_WIDTH - GAP;
  }
  left = Math.max(12, Math.min(left, vw - CARD_WIDTH - 12));
  top = Math.max(12, Math.min(top, vh - 220));
  return { top, left, transform: placement === "top" ? "translateY(-100%)" : undefined };
}

/**
 * Visite guidée : découpe le point d'intérêt dans un voile sombre, l'entoure
 * d'un anneau doré animé, pointe un curseur dessus et affiche une consigne dans
 * une carte adjacente. Voir src/config/tours.ts pour la définition des étapes.
 */
export function GuidedTour({
  steps,
  open,
  onClose,
}: {
  steps: TourStep[];
  open: boolean;
  onClose: (completed: boolean) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [missing, setMissing] = useState(false);
  const targetRef = useRef<Element | null>(null);

  // Réinitialise à l'ouverture — ajustement d'état pendant le rendu quand une
  // prop change (react.dev/learn/you-might-not-need-an-effect), même pattern
  // que AppShell avec `lastPathname`.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStepIndex(0);
      setBox(null);
      setMissing(false);
    }
  }

  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      onClose(true);
      return;
    }
    setBox(null);
    setMissing(false);
    setStepIndex((i) => i + 1);
  }, [stepIndex, steps.length, onClose]);
  const prev = useCallback(() => {
    setBox(null);
    setMissing(false);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Résout l'élément cible de l'étape courante (avec attente : le modal peut
  // n'apparaître qu'après le clic de l'étape précédente).
  useEffect(() => {
    if (!open || !step) return;
    let raf = 0;
    let cancelled = false;
    const start = performance.now();

    const remeasure = () => {
      if (targetRef.current && targetRef.current.isConnected) setBox(measure(targetRef.current));
    };

    const tick = () => {
      if (cancelled) return;
      const el = document.querySelector(step.selector);
      if (el) {
        targetRef.current = el;
        el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
        setBox(measure(el));
        // Nouvelle mesure après stabilisation du scroll.
        window.setTimeout(remeasure, 260);
        window.setTimeout(remeasure, 520);
        return;
      }
      if (performance.now() - start > RESOLVE_TIMEOUT_MS) {
        setMissing(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
      targetRef.current = null;
    };
  }, [open, step, stepIndex]);

  // Étape « advanceOn: click » — avance quand l'élément surligné est cliqué.
  useEffect(() => {
    if (!open || !step || step.advanceOn !== "click" || !box) return;
    const el = targetRef.current;
    if (!el) return;
    const handler = () => window.setTimeout(next, 120);
    el.addEventListener("click", handler, { once: true });
    return () => el.removeEventListener("click", handler);
  }, [open, step, box, next]);

  // Échap = quitter.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !step || typeof document === "undefined") return null;

  const placement = box ? resolvePlacement(box, step.placement ?? "auto") : "bottom";
  const card = box ? cardPosition(box, placement) : null;
  const clickToAdvance = step.advanceOn === "click";

  return createPortal(
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={translate("tour.aria.label")}>
      {box ? (
        <>
          {/* Voile en 4 bandes : laisse la cible cliquable au centre. */}
          <div className="nj-tour-veil" style={{ top: 0, left: 0, width: "100vw", height: Math.max(0, box.top - SPOT_PADDING) }} />
          <div
            className="nj-tour-veil"
            style={{ top: box.top + box.height + SPOT_PADDING, left: 0, width: "100vw", bottom: 0, height: "auto" }}
          />
          <div
            className="nj-tour-veil"
            style={{ top: box.top - SPOT_PADDING, left: 0, width: Math.max(0, box.left - SPOT_PADDING), height: box.height + SPOT_PADDING * 2 }}
          />
          <div
            className="nj-tour-veil"
            style={{ top: box.top - SPOT_PADDING, left: box.left + box.width + SPOT_PADDING, right: 0, width: "auto", height: box.height + SPOT_PADDING * 2 }}
          />

          {/* Anneau + curseur animé sur la cible. */}
          <div
            className="nj-tour-ring"
            style={{
              top: box.top - SPOT_PADDING,
              left: box.left - SPOT_PADDING,
              width: box.width + SPOT_PADDING * 2,
              height: box.height + SPOT_PADDING * 2,
            }}
          />
          <div
            className="nj-tour-pointer"
            style={{ top: box.top + box.height - 6, left: box.left + box.width - 10 }}
            aria-hidden
          >
            <span className="nj-tour-pointer-ring" />
            <MousePointerClick className="h-6 w-6 text-accent drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
          </div>
        </>
      ) : (
        <div className="nj-tour-veil" style={{ inset: 0, width: "100vw", height: "100vh" }} />
      )}

      {/* Carte de consigne. */}
      <div
        className="fixed w-[340px] max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-surface p-4 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        style={card ? { top: card.top, left: card.left, transform: card.transform } : { top: 24, left: "50%", transform: "translateX(-50%)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-accent-bg px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-link uppercase">
            {translate("tour.step", { current: stepIndex + 1, total: steps.length })}
          </span>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            title={translate("tour.skip")}
            aria-label={translate("tour.skip")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-2 text-sm font-bold text-foreground text-pretty">{translate(step.titleKey)}</h2>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-muted-foreground text-pretty">{translate(step.bodyKey)}</p>

        {missing ? (
          <p className="mt-2 rounded-lg bg-warning-bg px-2.5 py-1.5 text-[11.5px] text-warning">{translate("tour.missing")}</p>
        ) : null}

        {clickToAdvance && !missing ? (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent-bg px-2.5 py-1.5 text-[11.5px] font-medium text-link">
            <MousePointerClick className="h-3.5 w-3.5" />
            {translate("tour.clickHint")}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 w-1.5 rounded-full", i === stepIndex ? "bg-accent" : "bg-border")}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {translate("tour.prev")}
              </button>
            ) : null}
            {clickToAdvance && !missing ? null : (
              <button
                type="button"
                onClick={next}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-accent px-3 text-[12px] font-bold text-accent-foreground transition-[filter] hover:brightness-95"
              >
                {isLast ? translate("tour.done") : translate("tour.next")}
                {isLast ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
