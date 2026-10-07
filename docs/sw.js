/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "40f14d2d4abc209ea0b39d8926dabc80"
  }, {
    "url": "pwa-512x512.png",
    "revision": "7acc59951d9e508bb542e2aeff6a4d63"
  }, {
    "url": "pwa-192x192.png",
    "revision": "40e176973051b0e306118c2150036423"
  }, {
    "url": "index.html",
    "revision": "14cfc69831adf50805d493ed1eb8d6fe"
  }, {
    "url": "icon.svg",
    "revision": "9ae4437497eb94ec0bbd67724e2615e3"
  }, {
    "url": "icon.png",
    "revision": "66ddf38fd5b6428d4591d763ecd91615"
  }, {
    "url": "favicon.png",
    "revision": "03985582659cec29235e7540efcf4fbc"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8760da4834b43f93d77e80848f634160"
  }, {
    "url": "assets/web-DrMc_G_P.js",
    "revision": null
  }, {
    "url": "assets/web-DCckgEow.js",
    "revision": null
  }, {
    "url": "assets/index-VTPP94XF.js",
    "revision": null
  }, {
    "url": "assets/index-DPI34g_w.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "8760da4834b43f93d77e80848f634160"
  }, {
    "url": "favicon.png",
    "revision": "03985582659cec29235e7540efcf4fbc"
  }, {
    "url": "icon.png",
    "revision": "66ddf38fd5b6428d4591d763ecd91615"
  }, {
    "url": "icon.svg",
    "revision": "9ae4437497eb94ec0bbd67724e2615e3"
  }, {
    "url": "pwa-192x192.png",
    "revision": "40e176973051b0e306118c2150036423"
  }, {
    "url": "pwa-512x512.png",
    "revision": "7acc59951d9e508bb542e2aeff6a4d63"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "40f14d2d4abc209ea0b39d8926dabc80"
  }, {
    "url": "manifest.webmanifest",
    "revision": "44be69cf145f0abaf75e714c82029d71"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
