import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NJ Global Trade",
    short_name: "NJ Trade",
    description: "Plateforme de gestion commerciale, achats et facturation NJ Global Trade.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fcfcfa",
    theme_color: "#111111",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
