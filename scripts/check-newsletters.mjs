import { readFile, mkdir, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const records = [...source.matchAll(/\{\s*id:'([^']+)'[^\n]*?url:'(https:[^']+)'/g)].map(([, id, url]) => ({ id, url }));
const timeout = (ms) => AbortSignal.timeout(ms);

async function check({ id, url }) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, { method, redirect: 'follow', signal: timeout(15000), headers: { 'user-agent': 'NewsletterDirectoryLinkCheck/1.0 (+GitHub Pages)' } });
      if (response.ok || response.status === 403 || response.status === 405) return { id, url, status: 'reachable', httpStatus: response.status };
    } catch { /* GET fallback below */ }
  }
  return { id, url, status: 'needs-review' };
}

const results = [];
for (let index = 0; index < records.length; index += 4) results.push(...await Promise.all(records.slice(index, index + 4).map(check)));
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(new URL('../data/link-status.json', import.meta.url), `${JSON.stringify({ checkedAt: new Date().toISOString(), count: results.length, results }, null, 2)}\n`);
console.log(`Checked ${results.length} official newsletter links.`);
