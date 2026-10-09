"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setVisible(true);
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	if (!visible || !deferredPrompt) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
			<div className="pixel-panel flex w-full max-w-md items-center gap-3 bg-stone-900 px-4 py-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-lime-400 bg-sky-600 font-pixel text-[10px] text-white">
					M!
				</div>
				<div className="min-w-0 flex-1">
					<div className="font-pixel text-[10px] text-white">
						Installeer Marixtotle
					</div>
					<div className="text-xl leading-tight text-stone-300">
						Werkt ook offline
					</div>
				</div>
				<button
					type="button"
					onClick={async () => {
						await deferredPrompt.prompt();
						const choice = await deferredPrompt.userChoice;
						if (choice.outcome === "accepted") setVisible(false);
						setDeferredPrompt(null);
					}}
					className="pixel-btn shrink-0 bg-lime-400 px-4 py-1.5 font-pixel text-[10px] text-stone-900"
				>
					Installeren
				</button>
				<button
					type="button"
					aria-label="Sluiten"
					onClick={() => setVisible(false)}
					className="shrink-0 p-1 text-stone-400 hover:text-white"
				>
					✕
				</button>
			</div>
		</div>
	);
}
