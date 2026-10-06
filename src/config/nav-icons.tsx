import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  CreditCard,
  Receipt,
  LineChart,
  FileText,
  ShieldCheck,
  Settings,
  Headset,
  CircleUserRound,
  Bell,
  type LucideIcon,
} from "lucide-react";

/**
 * Associe chaque icône du plan de navigation (src/config/navigation.ts) à son
 * équivalent lucide-react. Les libellés d'origine (repris du template Material
 * Symbols, ex. "inventory_2") sont conservés comme clés dans navigation.ts
 * pour ne pas coupler la donnée de navigation à une bibliothèque d'icônes
 * précise — seule cette table de correspondance dépend de lucide-react.
 */
export const NAV_ICONS: Record<string, LucideIcon> = {
  space_dashboard: LayoutDashboard,
  inventory_2: Package,
  groups: Users,
  local_shipping: Truck,
  shopping_cart: ShoppingCart,
  credit_card: CreditCard,
  receipt_long: Receipt,
  monitoring: LineChart,
  description: FileText,
  admin_panel_settings: ShieldCheck,
  settings: Settings,
  support_agent: Headset,
  account_circle: CircleUserRound,
  notifications: Bell,
};

export function getNavIcon(name: string): LucideIcon {
  return NAV_ICONS[name] ?? Package;
}
