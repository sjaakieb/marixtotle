import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Marixtotle – Taaltrainer",
		short_name: "Marixtotle",
		description:
			"Duolingo-variant voor huiswerk – Nederlands ↔ Latijn, Frans, Engels & Grieks",
		id: "/",
		start_url: "/",
		scope: "/",
		display: "standalone",
		display_override: ["standalone", "window-controls-overlay", "browser"],
		background_color: "#fafaf9",
		theme_color: "#0284c7",
		orientation: "portrait",
		lang: "nl",
		dir: "ltr",
		categories: ["education", "utilities"],
		icons: [
			{
				src: "/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-512x512-maskable.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/apple-icon.png",
				sizes: "180x180",
				type: "image/png",
				purpose: "any",
			},
		],
		screenshots: [],
		prefer_related_applications: false,
		launch_handler: {
			client_mode: ["navigate-existing", "auto"],
		},
	};
}
