const fs = require('node:fs');
const path = require('node:path');

const chunksDir = path.join(process.cwd(), '.next', 'server', 'chunks');
const files = fs.existsSync(chunksDir)
  ? fs.readdirSync(chunksDir).filter(file => file.endsWith('.js'))
  : [];

const broken = files.some(file => {
  const source = fs.readFileSync(path.join(chunksDir, file), 'utf8');
  return /\(void 0\)\([^\n]*hd-engine-v6\.cjs/.test(source);
});

if (broken) {
  throw new Error('Webpack compiled the HD runtime loader to void 0');
}

console.log('Webpack HD runtime loader check passed');
