import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
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

const pixel = Press_Start_2P({
	variable: "--font-pixel",
	subsets: ["latin", "latin-ext"],
	weight: "400",
});

const terminal = VT323({
	variable: "--font-terminal",
	subsets: ["latin", "latin-ext"],
	weight: "400",
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
	colorScheme: "light dark",
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

const themeScript = `(function(){try{var t=localStorage.getItem('marixtotle-theme');var s=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='dark'||(t!=='light'&&t!=='dark'&&s);if(d){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="nl"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} ${pixel.variable} ${terminal.variable} h-full antialiased`}
		>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline theme script, no user input — prevents dark-mode FOUC */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="min-h-full flex flex-col">
				{children}
				<PWAInstallPrompt />
				<ServiceWorkerRegister />
			</body>
		</html>
	);
}
