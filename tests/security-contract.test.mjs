import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('custom URLs remove secrets and reject local or credential-bearing hosts', () => {
  const source = read('src/customSources.ts');
  assert.match(source, /if \(u\.username \|\| u\.password \|\| u\.port\) return null/);
  assert.match(source, /u\.search = ''/);
  assert.match(source, /host === 'localhost'/);
  assert.match(read('src/App.tsx'), /normalizeCustomSources\(data\.customSources/);
});

test('reader extraction requires an explicit click and discloses third parties', () => {
  const liveDesk = read('src/components/LiveDesk.tsx');
  assert.match(liveDesk, /출처를 고르는 것만으로는 외부 요청을 보내지 않습니다/);
  assert.match(liveDesk, /본문 불러오기/);
  assert.doesNotMatch(liveDesk, /\(async \(\) => \{\s*setReaderLoading\(true\)/);
});

test('CSV export neutralizes spreadsheet formulas', () => {
  const app = read('src/App.tsx');
  assert.match(app, /\? `'\$\{raw\}` : raw/);
  assert.match(app, /cells\.map\(csvCell\)/);
});

test('workflows pin third-party actions and public legal files exist', () => {
  for (const file of ['.github/workflows/ci.yml', '.github/workflows/deploy-pages.yml', '.github/workflows/check-newsletters.yml']) {
    const workflow = read(file);
    for (const match of workflow.matchAll(/uses:\s+[^\s@]+@([^\s]+)/g)) {
      assert.match(match[1], /^[0-9a-f]{40}$/);
    }
  }
  for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'public/manifest.webmanifest', 'public/icon.svg']) {
    assert.ok(fs.statSync(path.join(root, file)).size > 0, `${file} must not be empty`);
  }
});
