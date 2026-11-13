import { createHash } from "node:crypto";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

/** Generate a clean icon PNG buffer (indigo card with white page & green check) using built-in zlib. */
function generateIconPng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const scale = size / 512;
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // PNG filter type 0
    const py = y / scale;
    for (let x = 0; x < size; x++) {
      const px = x / scale;
      let r = 79, g = 70, b = 229; // #4f46e5 indigo background
      if (px >= 96 && px <= 416 && py >= 88 && py <= 424) {
        r = 255; g = 255; b = 255;
        if (px >= 156 && px <= 356 && py >= 164 && py <= 194) {
          r = 79; g = 70; b = 229;
        } else if (px >= 156 && px <= 292 && py >= 228 && py <= 258) {
          r = 79; g = 70; b = 229;
        } else {
          const d1 = Math.abs((py - 328) - (px - 204));
          const d2 = Math.abs((py - 368) + (px - 244));
          if (
            (px >= 198 && px <= 248 && py >= 320 && py <= 376 && d1 <= 18) ||
            (px >= 240 && px <= 338 && py >= 274 && py <= 376 && d2 <= 18)
          ) {
            r = 21; g = 128; b = 61;
          }
        }
      }
      const idx = rowStart + 1 + x * 4;
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
    }
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = "dist";
const base = process.env.DEPLOY_TARGET === "ghpages" ? "/grammar-app-quiz/" : "/";
const assetsDir = join(outDir, "assets");
const assetFiles = readdirSync(assetsDir).map((f) => `${base}assets/${f}`);

writeFileSync(join(outDir, "icon-192.png"), generateIconPng(192));
writeFileSync(join(outDir, "icon-512.png"), generateIconPng(512));

const manifest = {
  name: "Grammar Drill",
  short_name: "Grammar Drill",
  description:
    "Latihan grammar bahasa Inggris interaktif: 12 Tenses, Grammar Basics, dan Question & Answer.",
  start_url: base,
  scope: base,
  display: "standalone",
  background_color: "#fbf6ea",
  theme_color: "#fbf6ea",
  icons: [
    {
      src: `${base}icon-192.png`,
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: `${base}icon-512.png`,
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: `${base}icon.svg`,
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
  ],
};
writeFileSync(join(outDir, "manifest.webmanifest"), JSON.stringify(manifest, null, 2));

const precacheUrls = [
  base,
  `${base}index.html`,
  `${base}manifest.webmanifest`,
  `${base}icon.svg`,
  `${base}icon-192.png`,
  `${base}icon-512.png`,
  ...assetFiles,
];
const versionHash = createHash("sha256")
  .update(precacheUrls.join("|"))
  .digest("hex")
  .slice(0, 8);
const cacheName = `grammar-drill-${versionHash}`;

const swCode = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match(${JSON.stringify(`${base}index.html`)}) || caches.match(${JSON.stringify(base)});
          }
        });
    })
  );
});
`;
writeFileSync(join(outDir, "sw.js"), swCode);
