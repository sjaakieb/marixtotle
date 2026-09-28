import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Marixtotle – Taaltrainer",
		template: "%s | Marixtotle",
	},
	description:
		"Duolingo-variant voor huiswerk – Nederlands ↔ Latijn, Frans, Engels & Grieks",
	applicationName: "Marixtotle",
	manifest: "/manifest.webmanifest",
	appleWebApp: {
		capable: true,
		title: "Marixtotle",
		statusBarStyle: "default",
	},
	formatDetection: {
		telephone: false,
	},
	icons: {
		icon: [
			{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
	},
};

export const viewport: Viewport = {
	themeColor: "#0284c7",
	colorScheme: "light",
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="nl"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				{children}
				<PWAInstallPrompt />
				<ServiceWorkerRegister />
			</body>
		</html>
	);
}
