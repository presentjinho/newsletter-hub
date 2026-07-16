/**
 * 전체 카탈로그 링크 검사 (data + industry + expand 시드 파일 직접 파싱)
 * 실패/리다이렉트 폭주 URL 목록 출력 + link-status.json 갱신
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const files = [
  'src/data.ts',
  'src/industryCatalog.ts',
  'src/catalogExpand.ts',
];

function parseRecords(source) {
  const out = [];
  // id: '...' ... siteUrl: 'https...'
  const re =
    /id:\s*'([^']+)'[\s\S]*?(?:siteUrl|url):\s*'(https?:\/\/[^']+)'/g;
  let m;
  while ((m = re.exec(source))) {
    out.push({ id: m[1], url: m[2] });
  }
  return out;
}

const byId = new Map();
for (const f of files) {
  const source = await readFile(path.join(root, f), 'utf8');
  for (const row of parseRecords(source)) {
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
}
const unique = [...byId.values()];
console.log(`Unique URLs to check: ${unique.length}`);

const timeout = (ms) => AbortSignal.timeout(ms);

async function check({ id, url }) {
  const headers = {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8',
  };
  let lastStatus = 0;
  let finalUrl = url;
  for (const method of ['GET', 'HEAD']) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: timeout(12000),
        headers,
      });
      lastStatus = response.status;
      finalUrl = response.url || url;
      // 2xx, 3xx already followed; 401/403 = 살아있으나 봇 차단 → reachable
      if (
        response.ok ||
        response.status === 401 ||
        response.status === 403 ||
        response.status === 405 ||
        response.status === 429
      ) {
        return {
          id,
          url,
          finalUrl,
          status: 'reachable',
          httpStatus: response.status,
        };
      }
    } catch (e) {
      lastStatus = 0;
    }
  }
  return {
    id,
    url,
    finalUrl,
    status: 'needs-review',
    httpStatus: lastStatus || undefined,
  };
}

const results = [];
const concurrency = 6;
for (let i = 0; i < unique.length; i += concurrency) {
  const batch = unique.slice(i, i + concurrency);
  const part = await Promise.all(batch.map(check));
  results.push(...part);
  process.stdout.write(`\rChecked ${results.length}/${unique.length}`);
}
console.log('');

const bad = results.filter(r => r.status !== 'reachable');
const good = results.filter(r => r.status === 'reachable');
console.log(`OK ${good.length} · needs-review ${bad.length}`);
if (bad.length) {
  console.log('\n--- NEEDS REVIEW ---');
  for (const r of bad) {
    console.log(`${r.id}\t${r.httpStatus || '-'}\t${r.url}`);
  }
}

const payload = JSON.stringify(
  {
    checkedAt: new Date().toISOString(),
    count: results.length,
    reachable: good.length,
    needsReview: bad.length,
    results: results.map(({ id, url, status, httpStatus, finalUrl }) => ({
      id,
      url,
      status,
      httpStatus,
      finalUrl: finalUrl !== url ? finalUrl : undefined,
    })),
  },
  null,
  2,
) + '\n';

await mkdir(path.join(root, 'public/data'), { recursive: true });
await writeFile(path.join(root, 'public/data/link-status.json'), payload);
await mkdir(path.join(root, 'data'), { recursive: true });
await writeFile(path.join(root, 'data/link-status.json'), payload);
console.log('Wrote public/data/link-status.json');
