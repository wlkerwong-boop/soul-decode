const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/planet-gates.json','utf-8'));
const reduced = {};
for (const [key, val] of Object.entries(data)) {
  const y = parseInt(key);
  if (y >= 1950 && y <= 2050) {
    const gates = [];
    for (let i = 0; i < val.length; i += 2) gates.push(val[i]);
    reduced[key] = gates;
  }
}
fs.writeFileSync('public/planet-gates.json', JSON.stringify(reduced));
const orig = Object.keys(data).length;
const now = Object.keys(reduced).length;
const size = Math.round(JSON.stringify(reduced).length / 1024);
console.log(`${orig} → ${now} entries, ${size}KB`);
