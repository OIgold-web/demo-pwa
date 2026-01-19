const CACHE_NAME = "demo-pwa-v1";
const OFFLINE_URL = "index1.html";

const ASSETS_TO_CACHE = [
  "/demo-pwa/",
  "index1.html",
  "manifest.json",
  "service-worker.js",
  "icon1.png",
  "icon2.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch (Network First → Cache Fallback)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request).then(res => res || caches.match(OFFLINE_URL)))
  );
});

// Handle Share Target
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
                      
