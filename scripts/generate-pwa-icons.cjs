const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// High-definition SVG of the ODPE ICA emblem with rich dark-blue/amber gradient background
function getSvg(size, isMaskable = false) {
  // If maskable, we add padding so the icon is in the safe 80% inner circle
  const scale = isMaskable ? 0.72 : 0.85;
  const offset = ((1 - scale) / 2) * size;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="60%" stop-color="#0369a1" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>

      <linearGradient id="sunGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="50%" stop-color="#FBBF24" />
        <stop offset="100%" stop-color="#F59E0B" />
      </linearGradient>

      <linearGradient id="raysGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FEF08A" />
        <stop offset="60%" stop-color="#FBBF24" />
        <stop offset="100%" stop-color="#F59E0B" />
      </linearGradient>

      <linearGradient id="waveGrad" x1="15" y1="65" x2="85" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FBBF24" />
        <stop offset="50%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background card -->
    <rect width="${size}" height="${size}" rx="${isMaskable ? 0 : Math.round(size * 0.22)}" fill="url(#bgGrad)" />

    <!-- Subtle inner glass glow ring -->
    <rect x="${Math.round(size * 0.04)}" y="${Math.round(size * 0.04)}" width="${Math.round(size * 0.92)}" height="${Math.round(size * 0.92)}" rx="${isMaskable ? 0 : Math.round(size * 0.2)}" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="${Math.max(1, Math.round(size * 0.015))}" />

    <!-- Centered Logo Group -->
    <g transform="translate(${offset}, ${offset * 0.85}) scale(${scale * (size / 100)})">
      <!-- RAYS -->
      <g filter="url(#glow)">
        <line x1="12" y1="56" x2="28" y2="57.5" stroke="url(#raysGrad)" stroke-width="4.2" stroke-linecap="round" />
        <line x1="18" y1="42" x2="31" y2="47" stroke="url(#raysGrad)" stroke-width="4.2" stroke-linecap="round" />
        <line x1="27" y1="28" x2="38" y2="37" stroke="url(#raysGrad)" stroke-width="4.4" stroke-linecap="round" />
        <line x1="40" y1="18" x2="45.5" y2="29" stroke="url(#raysGrad)" stroke-width="4.4" stroke-linecap="round" />
        <line x1="50" y1="13" x2="50" y2="26" stroke="url(#raysGrad)" stroke-width="4.6" stroke-linecap="round" />
        <line x1="60" y1="18" x2="54.5" y2="29" stroke="url(#raysGrad)" stroke-width="4.4" stroke-linecap="round" />
        <line x1="73" y1="28" x2="62" y2="37" stroke="url(#raysGrad)" stroke-width="4.4" stroke-linecap="round" />
        <line x1="82" y1="42" x2="69" y2="47" stroke="url(#raysGrad)" stroke-width="4.2" stroke-linecap="round" />
        <line x1="88" y1="56" x2="72" y2="57.5" stroke="url(#raysGrad)" stroke-width="4.2" stroke-linecap="round" />
      </g>

      <!-- SUN DOME -->
      <path d="M 27 60 C 27 40 37.3 30 50 30 C 62.7 30 73 40 73 60" stroke="url(#sunGrad)" stroke-width="5.2" stroke-linecap="round" filter="url(#glow)" />

      <!-- DUNES WAVE -->
      <path d="M 22 75 C 34 75 42 73 48 68 C 53 64 58 64 57 70 C 56 74 64 76 74 74 C 77 73.5 82 72.5 83 72.5" stroke="url(#waveGrad)" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round" />

      <!-- ODPE ICA TEXT LABEL -->
      <text x="50" y="93" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="12" fill="#ffffff" letter-spacing="1">ODPE <tspan fill="#FBBF24">ICA</tspan></text>
    </g>
  </svg>
  `;
}

async function run() {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Standalone SVG
  const svg512 = getSvg(512, false);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg512);
  console.log('Created icon.svg');

  // 2. 192x192 PNG
  await sharp(Buffer.from(svg512))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 3. 512x512 PNG
  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 4. 512x512 Maskable PNG (full bleed background, padded logo)
  const maskableSvg = getSvg(512, true);
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 5. 180x180 Apple Touch Icon PNG
  await sharp(Buffer.from(svg512))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 6. Favicon 64x64 PNG & ICO
  await sharp(Buffer.from(svg512))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');
}

run().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
