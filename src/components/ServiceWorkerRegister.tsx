"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
	useEffect(() => {
		if (
			typeof window === "undefined" ||
			!("serviceWorker" in navigator) ||
			process.env.NODE_ENV !== "production"
		) {
			// In development we avoid caching to prevent stale HMR.
			// Uncomment the next line to test SW locally in dev:
			// if (!("serviceWorker" in navigator)) return;
			return;
		}

		const register = async () => {
			try {
				const reg = await navigator.serviceWorker.register("/sw.js", {
					scope: "/",
					updateViaCache: "none",
				});

				// Check for updates periodically
				reg.addEventListener("updatefound", () => {
					const worker = reg.installing;
					if (!worker) return;
					worker.addEventListener("statechange", () => {
						if (
							worker.state === "installed" &&
							navigator.serviceWorker.controller
						) {
							// New content available — could show toast. Log for now.
							console.log("[PWA] New content available, refresh to update.");
						}
					});
				});

				// Also poll for updates every hour
				setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
			} catch (err) {
				console.warn("[PWA] Service worker registration failed:", err);
			}
		};

		register();

		// Reload when new SW takes control
		let refreshing = false;
		const onControllerChange = () => {
			if (refreshing) return;
			refreshing = true;
			window.location.reload();
		};
		navigator.serviceWorker.addEventListener(
			"controllerchange",
			onControllerChange,
		);
		return () =>
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				onControllerChange,
			);
	}, []);

	return null;
}
