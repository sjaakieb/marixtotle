// Marixtotle PWA Service Worker
// Increment CACHE_VERSION to force cache invalidation on deploy
const CACHE_VERSION = "v1";
const CACHE_NAME = `marixtotle-${CACHE_VERSION}`;

// App shell — cached on install for offline start
const PRECACHE_URLS = [
	"/",
	"/manifest.webmanifest",
	"/icon-192x192.png",
	"/icon-512x512.png",
	"/icon-512x512-maskable.png",
	"/apple-icon.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

// Fetch strategy:
// - For navigations: network-first, fallback to cache (offline support)
// - For static assets (_next/static, images, fonts): cache-first, fallback to network
// - For other GETs: stale-while-revalidate
self.addEventListener("fetch", (event) => {
	const req = event.request;
	if (req.method !== "GET") return;

	const url = new URL(req.url);

	// Only handle same-origin requests
	if (url.origin !== self.location.origin) return;

	// Navigation requests (documents)
	if (
		req.mode === "navigate" ||
		req.headers.get("accept")?.includes("text/html")
	) {
		event.respondWith(
			fetch(req)
				.then((res) => {
					// Cache successful navigations
					const clone = res.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
					return res;
				})
				.catch(async () => {
					const cache = await caches.open(CACHE_NAME);
					const cached = await cache.match(req);
					if (cached) return cached;
					// Fallback to cached "/" for SPA-style offline
					const fallback = await cache.match("/");
					if (fallback) return fallback;
					return new Response("Offline — geen verbinding", {
						status: 503,
						headers: { "Content-Type": "text/plain; charset=utf-8" },
					});
				}),
		);
		return;
	}

	// Static assets: Next.js bundles, icons, images
	if (
		url.pathname.startsWith("/_next/") ||
		url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|css|js)$/)
	) {
		event.respondWith(
			caches.match(req).then((cached) => {
				if (cached) return cached;
				return fetch(req)
					.then((res) => {
						// Only cache valid responses
						if (res.ok) {
							const clone = res.clone();
							caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
						}
						return res;
					})
					.catch(() => cached || Response.error());
			}),
		);
		return;
	}

	// Default: stale-while-revalidate
	event.respondWith(
		caches.match(req).then((cached) => {
			const fetchPromise = fetch(req)
				.then((res) => {
					if (res.ok) {
						const clone = res.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
					}
					return res;
				})
				.catch(() => cached);
			return cached || fetchPromise;
		}),
	);
});

// Push notifications (optional — enables Web Push if VAPID is configured later)
self.addEventListener("push", (event) => {
	if (!event.data) return;
	try {
		const data = event.data.json();
		const options = {
			body: data.body,
			icon: data.icon || "/icon-192x192.png",
			badge: "/icon-192x192.png",
			vibrate: [100, 50, 100],
			data: {
				dateOfArrival: Date.now(),
				primaryKey: "1",
			},
		};
		event.waitUntil(
			self.registration.showNotification(data.title || "Marixtotle", options),
		);
	} catch {
		// Fallback for plain text pushes
		event.waitUntil(
			self.registration.showNotification("Marixtotle", {
				body: event.data.text(),
				icon: "/icon-192x192.png",
			}),
		);
	}
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	event.waitUntil(clients.openWindow("/"));
});
