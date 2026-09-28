import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	async headers() {
		return [
			{
				source: "/sw.js",
				headers: [
					{
						key: "Content-Type",
						value: "application/javascript; charset=utf-8",
					},
					{
						key: "Cache-Control",
						value: "no-cache, no-store, must-revalidate",
					},
				],
			},
			{
				// Allow manifest to be fetched
				source: "/manifest.webmanifest",
				headers: [
					{
						key: "Content-Type",
						value: "application/manifest+json",
					},
				],
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/woordenlijst/:chapterId",
				destination: "/words/:chapterId",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
