const fs = require('fs');
const path = require('path');

// Minimal 1x1 PNG (orange-ish) — valid PNG file
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });

for (const name of ['icon.png', 'splash-icon.png', 'adaptive-icon.png', 'favicon.png']) {
  fs.writeFileSync(path.join(dir, name), png);
}

console.log('Assets created in', dir);
