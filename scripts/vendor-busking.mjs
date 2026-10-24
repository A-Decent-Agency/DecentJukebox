import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(readFileSync(resolve(root, 'sources/busking.json'), 'utf8'));
if (!/^[0-9a-f]{40}$/.test(source.commit)) throw new Error('Use a full immutable source commit, never a branch');
const vendor = resolve(root, 'vendor/busking');
const inventoryPath = resolve(vendor, 'INVENTORY.json');
const hash = data => createHash('sha256').update(data).digest('hex');
const target = path => path === 'test/djuke-widget.test.js' ? 'test/djuke-widget.test.cjs' : path;
if (process.argv[2] === '--refresh' && process.argv[3]) {
  const repository = resolve(process.argv[3]);
  const actual = execFileSync('git', ['-C', repository, 'rev-parse', `${source.commit}^{commit}`], { encoding: 'utf8' }).trim();
  if (actual !== source.commit) throw new Error('Source did not resolve to the pinned commit');
  const files = [];
  for (const path of source.files) {
    if (path.includes('..') || path.startsWith('/')) throw new Error('Unsafe source path');
    const bytes = execFileSync('git', ['-C', repository, 'show', `${source.commit}:${path}`]);
    const destination = target(path);
    mkdirSync(dirname(resolve(vendor, destination)), { recursive: true });
    writeFileSync(resolve(vendor, destination), bytes);
    files.push({ source: path, path: destination, sha256: hash(bytes) });
  }
  writeFileSync(inventoryPath, JSON.stringify({ repository: source.repository, commit: source.commit, files }, null, 2) + '\n');
} else if (process.argv[2] !== '--check') {
  throw new Error('Usage: node scripts/vendor-busking.mjs --check | --refresh /path/to/DecentBusking');
}
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
if (inventory.commit !== source.commit || inventory.repository !== source.repository) throw new Error('Source manifest/inventory mismatch');
if (inventory.files.length !== source.files.length) throw new Error('Unexpected vendored file count');
for (const path of source.files) {
  const entry = inventory.files.find(entry => entry.source === path && entry.path === target(path));
  if (!entry || hash(readFileSync(resolve(vendor, entry.path))) !== entry.sha256) throw new Error(`Source hash mismatch: ${path}`);
}
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(resolve(directory, entry.name)) : [relative(vendor, resolve(directory, entry.name))]);
}
const expected = new Set(['INVENTORY.json', ...inventory.files.map(entry => entry.path)]);
for (const path of walk(vendor)) if (!expected.has(path)) throw new Error(`Untracked vendored file: ${path}`);
console.log(`Verified ${inventory.files.length} source files at ${source.commit}`);
