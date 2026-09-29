import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iridius",
    short_name: "Iridius",
    description:
      "On Robinhood Chain, swap tokenized real-world assets at prices pinned to the live mid.",
    start_url: "/",
    display: "standalone",
    background_color: "#05090f",
    theme_color: "#05090f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
