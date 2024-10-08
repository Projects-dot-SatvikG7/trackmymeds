// *** This is cache name, change this whenever you make changes to the app ***
const CACHE_NAME = "cache-v7";

// *** This is cache name, change this whenever you make changes to the app ***
const DYNAMIC_CACHE_NAME = "dynamic-cache-v7";

// *** Array of files that you want browser to cache (Mostly static assets) and think then as fetch requested ***
const CACHE_THIS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
];

// *** This event is fired when a new Service worker is installed ***
self.addEventListener("install", (event) => {
  // console.log("Service worker has been installed", event);
  // *** Wait until browser caches the files in CACHE_THIS array declared above ***
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(CACHE_THIS);
    })
  );
});

// *** This event is only fired when a new Service worker or old Service worker is activated ***
self.addEventListener("activate", (event) => {
  // console.log("Service worker has been activated", event);
  // *** Wait until browser deletes old files in CACHE_THIS array declared above, only the files files corresponding to CACHE_NAME cache are saved in cache ***
  event.waitUntil(
    caches.keys().then((keys) => {
      // @ keys are basically cache names
      // console.log(keys);
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => {
            caches.delete(key);
          })
      );
    })
  );
});

/*
@ This event intercepts every fetch request !

-- If the request exists in cache it return the caches file 
-- else if internet connection is available then the browser continues the request and the response is stored in DYNAMIC_CACHE_NAME cache for future fetch requests
--else if internet connection is unavailable then a fallback page (Offline.html) is shown to the user only if the requested page is of *.html format
*/
self.addEventListener("fetch", (event) => {
  const graphqlUrl = "https://green-feather-41331517.ap-south-1.aws.cloud.dgraph.io/graphql";
  const serviceWorkerUrl = `${self.location.origin}/service-worker.js`;

  if (event.request.url === graphqlUrl || event.request.url === serviceWorkerUrl) {
    // If the request is for the GraphQL endpoint or the service worker script, always fetch from network
    event.respondWith(fetch(event.request));
  } else {
    // Handle caching for other requests
    event.respondWith(
      caches.match(event.request).then((cacheResponse) => {
        return (
          cacheResponse ||
          fetch(event.request).then((fetchResponse) => {
            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
      .catch(() => {
        if (event.request.url.indexOf(".html") > -1) {
          return caches.match("/offline.html");
        }
      })
    );
  }
});
