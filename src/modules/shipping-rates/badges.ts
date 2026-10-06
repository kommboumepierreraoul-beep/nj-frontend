import type { ShippingMode } from "./types";
import { translate } from "@/i18n/translate";

export const SHIPPING_MODE_LABELS: Record<ShippingMode, string> = {
  get AERIEN() { return translate("badge.shippingrates.shippingMode.AERIEN"); },
  get MARITIME() { return translate("badge.shippingrates.shippingMode.MARITIME"); },
};
