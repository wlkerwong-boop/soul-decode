import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = '/Users/guangmingxishe/LifeOS/20-29 工作事业/24.01 灵魂解码运营/九宫人生解码';
const inventoryPath = new URL('../docs/jiugong-sources/inventory.json', import.meta.url);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    if (entry.name === '.DS_Store') return [];
    return [path.relative(sourceRoot, absolute)];
  });
}

if (!fs.existsSync(inventoryPath)) {
  throw new Error('inventory.json not found');
}

const actual = walk(sourceRoot).sort();
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const listed = inventory.sources.map((item) => item.path).sort();
const missing = actual.filter((item) => !listed.includes(item));
const extra = listed.filter((item) => !actual.includes(item));
const invalid = inventory.sources.filter((item) =>
  !item.sourceId || !item.path || !item.format || !item.status
  || !Array.isArray(item.topics),
);

if (missing.length || extra.length || invalid.length) {
  throw new Error(JSON.stringify({ missing, extra, invalid }, null, 2));
}

console.log(`PASS ${actual.length} source files, zero omissions`);
