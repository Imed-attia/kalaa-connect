const fs = require('fs');
const path = require('path');

// PNG 1x1 pixel vert minimal encodé
const minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzE10RRAAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(minimalPngBase64, 'base64');

const publicDir = path.resolve(__dirname, '../apps/web/public');

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), pngBuffer);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), pngBuffer);
console.log('Icônes PWA PNG générées avec succès dans apps/web/public !');
