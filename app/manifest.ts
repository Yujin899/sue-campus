import type { MetadataRoute } from "next";

/**
 * Brand colours sampled from public/logo-light.png (navy #092A51, gold #BD9553).
 * The app defaults to its dark theme, so the splash background is a very dark
 * navy that sits close to --background, and the UI tint is the brand navy.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sue Campus",
    short_name: "Sue Campus",
    description: "Student resources for Al Salam University (SUE)",
    // "/" redirects to /dashboard, so start there directly.
    start_url: "/dashboard",
    // Stable identity so the browser keeps recognising the installed app
    // across manifest changes.
    id: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B1424",
    theme_color: "#0B2D5C",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
