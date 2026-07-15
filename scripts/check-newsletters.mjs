import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Parse ids + urls from Vite data source (AI Studio export)
const source = await readFile(new URL('../src/data.ts', import.meta.url), 'utf8');
// prefer siteUrl, fallback url
const records = [
  ...source.matchAll(/id:\s*'([^']+)'[\s\S]*?(?:siteUrl|url):\s*'(https:[^']+)'/g),
].map(([, id, url]) => ({ id, url }));

// de-dupe by id (regex may over-match multiline)
const byId = new Map();
for (const row of records) {
  if (!byId.has(row.id)) byId.set(row.id, row);
}
const unique = [...byId.values()];

const timeout = (ms) => AbortSignal.timeout(ms);

async function check({ id, url }) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: timeout(15000),
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
      });
      if (response.ok || response.status === 403 || response.status === 405) {
        return { id, url, status: 'reachable', httpStatus: response.status };
      }
    } catch {
      /* try next method */
    }
  }
  return { id, url, status: 'needs-review' };
}

const results = [];
for (let index = 0; index < unique.length; index += 4) {
  results.push(
    ...(await Promise.all(unique.slice(index, index + 4).map(check))),
  );
}

const payload = `${JSON.stringify(
  { checkedAt: new Date().toISOString(), count: results.length, results },
  null,
  2,
)}\n`;

await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/data/link-status.json', import.meta.url), payload);
// keep legacy path for older docs/scripts
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(new URL('../data/link-status.json', import.meta.url), payload);

console.log(`Checked ${results.length} official newsletter links.`);
