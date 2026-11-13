import { createHash } from "node:crypto";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

function sdRoundedBox(px, py, x, y, w, h, r) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const qx = Math.abs(px - cx) - (w / 2 - r);
  const qy = Math.abs(py - cy) - (h / 2 - r);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    r
  );
}

/** Seamless signed distance to the chunky letter "G" centered at (160, 220) */
function sdLetterG(px, py) {
  const cx = 160;
  const cy = 220;
  const rMid = 72.5;
  const halfThick = 21.5;

  const dx = px - cx;
  const dy = py - cy;
  const angle = Math.atan2(dy, dx);

  let dRing;
  if (angle > -0.58 && angle < 0.08) {
    const cap1x = cx + rMid * Math.cos(-0.58);
    const cap1y = cy + rMid * Math.sin(-0.58);
    dRing = Math.hypot(px - cap1x, py - cap1y) - halfThick;
  } else {
    dRing = Math.abs(Math.hypot(dx, dy) - rMid) - halfThick;
  }

  // Horizontal crossbar of G meeting the right ring seamlessly at x=254
  const dBar = sdRoundedBox(px, py, 158, 198, 96, 40, 12);
  return Math.min(dRing, dBar);
}

/** Seamless signed distance to the chunky letter "D" (x: 276..432, y: 126..314) */
function sdLetterD(px, py) {
  const dOuter =
    px >= 338
      ? Math.hypot(px - 338, py - 220) - 94
      : sdRoundedBox(px, py, 276, 126, 124, 188, 16);

  const dHole =
    px >= 338
      ? Math.hypot(px - 338, py - 220) - 51
      : sdRoundedBox(px, py, 319, 169, 60, 102, 6);

  return Math.max(dOuter, -dHole);
}

function dGradientColor(px, py) {
  const t = Math.min(1, Math.max(0, (px - 276 + (py - 126) * 0.5) / 240));
  if (t < 0.6) {
    const u = t / 0.6;
    return [
      Math.round(79 + (142 - 79) * u),
      Math.round(63 + (70 - 63) * u),
      Math.round(227 + (170 - 227) * u),
    ];
  }
  const u = (t - 0.6) / 0.4;
  return [
    Math.round(142 + (108 - 142) * u),
    Math.round(70 + (60 - 70) * u),
    Math.round(170 + (233 - 170) * u),
  ];
}

/** Sample 1 point in 512x512 virtual canvas for Pilihan 1: 3D "GD" Monogram + Orange Dot */
function sampleIconColor(px, py) {
  let color = [251, 246, 234]; // #fbf6ea

  function layerRoundRect(x, y, w, h, r, fill, borderW = 0) {
    const d = sdRoundedBox(px, py, x, y, w, h, r);
    if (d <= borderW) {
      color = d > 0 ? [20, 20, 20] : fill;
    }
  }

  // 1. Outer 3D Tile: Orange Bottom Lip (#f27d16) + Sunny Yellow Face (#fde48c)
  layerRoundRect(24, 36, 464, 452, 104, [242, 125, 22], 14);
  layerRoundRect(24, 20, 464, 442, 104, [253, 228, 140], 14);

  // 2. Inner Cream Stage Card (#fbf6ea) with 3D Black Shadow
  layerRoundRect(54, 60, 404, 364, 72, [20, 20, 20], 0);
  layerRoundRect(54, 50, 404, 362, 72, [251, 246, 234], 10);

  // 3. 3D Extrusion + Main Letter "G"
  const dGShadow = sdLetterG(px - 8, py - 10);
  if (dGShadow <= 6) {
    color = dGShadow > 0 ? [20, 20, 20] : [53, 167, 244]; // #35a7f4 sky blue lip
  }
  const dG = sdLetterG(px, py);
  if (dG <= 6) {
    color = dG > 0 ? [20, 20, 20] : [33, 42, 85]; // #212a55 deep navy
  }

  // 4. 3D Extrusion + Main Letter "D"
  const dDShadow = sdLetterD(px - 8, py - 10);
  if (dDShadow <= 6) {
    color = dDShadow > 0 ? [20, 20, 20] : [203, 178, 255]; // #cbb2ff lavender lip
  }
  const dD = sdLetterD(px, py);
  if (dD <= 6) {
    color = dD > 0 ? [20, 20, 20] : dGradientColor(px, py);
  }

  // 5. Signature 3D Orange Dot (Top-Right of D)
  if (Math.hypot(px - 413, py - 116) <= 31) {
    color = [20, 20, 20];
  }
  const dDot = Math.hypot(px - 408, py - 110) - 25;
  if (dDot <= 5.5) {
    color = dDot > 0 ? [20, 20, 20] : [242, 125, 22]; // #f27d16
  }
  if (Math.hypot(px - 400, py - 102) <= 5.5) {
    color = [255, 255, 255];
  }

  // 6. Bottom 3D Tag Pills (Purple, Mint Green, Bubblegum Pink)
  layerRoundRect(92, 355, 98, 30, 15, [104, 51, 212], 7);
  layerRoundRect(92, 347, 98, 30, 15, [140, 82, 255], 7);

  layerRoundRect(207, 355, 98, 30, 15, [56, 168, 109], 7);
  layerRoundRect(207, 347, 98, 30, 15, [90, 212, 148], 7);

  layerRoundRect(322, 355, 98, 30, 15, [214, 83, 156], 7);
  layerRoundRect(322, 347, 98, 30, 15, [251, 133, 198], 7);

  return color;
}

/** Generate an anti-aliased PNG buffer for the "GD" Monogram App Icon */
function generateIconPng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const scale = size / 512;
  const offsets = [0.25, 0.75];

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0;
      for (const oy of offsets) {
        for (const ox of offsets) {
          const [r, g, b] = sampleIconColor((x + ox) / scale, (y + oy) / scale);
          rSum += r;
          gSum += g;
          bSum += b;
        }
      }
      const idx = rowStart + 1 + x * 4;
      raw[idx] = rSum >> 2;
      raw[idx + 1] = gSum >> 2;
      raw[idx + 2] = bSum >> 2;
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
