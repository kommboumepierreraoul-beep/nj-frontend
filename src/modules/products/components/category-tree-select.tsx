"use client";

import { useMemo, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, ChevronRight, FolderTree, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { storageUrl } from "@/lib/media";
import type { ProductCategory } from "../types";
import { translate } from "@/i18n/translate";

interface CategoryNode extends ProductCategory {
  children: CategoryNode[];
}

function buildTree(categories: ProductCategory[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>();
  categories.forEach((category) => byId.set(category.id, { ...category, children: [] }));
  const roots: CategoryNode[] = [];
  byId.forEach((node) => {
    const parent = node.parent_id ? byId.get(node.parent_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    nodes.forEach((node) => sortNodes(node.children));
  };
  sortNodes(roots);
  return roots;
}

function nodeOrDescendantMatches(node: CategoryNode, query: string): boolean {
  if (!query || node.name.toLowerCase().includes(query)) return true;
  return node.children.some((child) => nodeOrDescendantMatches(child, query));
}

function CategoryIcon({ category }: { category: ProductCategory }) {
  const url = storageUrl(category.image_path);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- icône de catégorie déjà hébergée par l'API
    return <img src={url} alt="" className="h-4 w-4 shrink-0 rounded-[4px] object-cover" />;
  }
  return <FolderTree className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />;
}

/**
 * Sélecteur de catégorie en arborescence dépliable, avec icône par catégorie
 * (§ demande frontend : « les select de catégorie doivent être dépliables
 * pour voir les sous-catégories et il faut des icônes pour les catégories »).
 * `useProductCategories()` (endpoint `product-categories`) renvoie une liste
 * plate — l'arbre est reconstruit ici à partir de `parent_id` plutôt que de
 * dupliquer cette logique à chaque écran appelant.
 */
export function CategoryTreeSelect({
  categories,
  value,
  onChange,
  placeholder = translate("ph.selectionner"),
  clearLabel = "Aucune",
  excludeId,
  disabled,
  id,
  triggerClassName,
}: {
  categories: ProductCategory[];
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  clearLabel?: string;
  /** Exclut une catégorie et toute sa descendance (sélecteur de catégorie parente : une catégorie ne peut pas devenir sa propre descendante). */
  excludeId?: number;
  disabled?: boolean;
  id?: string;
  /** Classes appliquées au bouton déclencheur (largeur/hauteur selon le contexte : filtre compact vs champ de formulaire pleine largeur). */
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const available = useMemo(() => {
    if (excludeId === undefined) return categories;
    const excluded = new Set<number>([excludeId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const category of categories) {
        if (category.parent_id && excluded.has(category.parent_id) && !excluded.has(category.id)) {
          excluded.add(category.id);
          changed = true;
        }
      }
    }
    return categories.filter((category) => !excluded.has(category.id));
  }, [categories, excludeId]);

  const tree = useMemo(() => buildTree(available), [available]);
  const byId = useMemo(() => new Map(available.map((category) => [category.id, category])), [available]);
  const selected = value ? byId.get(value) : undefined;
  const query = search.trim().toLowerCase();

  function toggle(nodeId: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function renderNode(node: CategoryNode, depth: number) {
    if (!nodeOrDescendantMatches(node, query)) return null;
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id) || Boolean(query);

    return (
      <div key={node.id}>
        <div className="flex items-center gap-1" style={{ paddingLeft: depth * 16 }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(node.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center text-text-tertiary hover:text-foreground"
              title={isExpanded ? "Replier" : translate("t.deplier")}
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="h-6 w-6 shrink-0" />
          )}
          <button
            type="button"
            onClick={() => {
              onChange(node.id);
              setOpen(false);
            }}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-background",
              node.id === value && "bg-accent-bg text-link",
            )}
          >
            <Check className={cn("h-3.5 w-3.5 shrink-0", node.id === value ? "opacity-100" : "opacity-0")} />
            <CategoryIcon category={node} />
            <span className="truncate">{node.name}</span>
            {node.products_count !== undefined ? (
              <span className="ml-auto shrink-0 text-[11px] text-text-quaternary">{node.products_count}</span>
            ) : null}
          </button>
        </div>
        {hasChildren && isExpanded ? <div>{node.children.map((child) => renderNode(child, depth + 1))}</div> : null}
      </div>
    );
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-[46px] w-full items-center justify-between gap-2 rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-left text-[13.5px] text-foreground",
            "focus:outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-text-quaternary",
            triggerClassName,
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            {selected ? <CategoryIcon category={selected} /> : null}
            <span className="truncate">{selected ? selected.name : placeholder}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-[70] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[10px] border border-border bg-surface text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={translate("ph.rechercherUneCategorie")}
              className="h-6 w-full bg-transparent text-[13px] text-foreground placeholder:text-text-quaternary focus:outline-none"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] hover:bg-background",
                !value && "text-link",
              )}
            >
              <Check className={cn("h-3.5 w-3.5", value ? "opacity-0" : "opacity-100")} />
              {clearLabel}
            </button>
            {tree.length === 0 ? (
              <p className="px-2.5 py-3 text-center text-[12.5px] text-text-tertiary">{translate("t.aucuneCategorie")}</p>
            ) : (
              tree.map((node) => renderNode(node, 0))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
