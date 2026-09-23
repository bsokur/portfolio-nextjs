import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';
import { articleEndpoint, normalizeArticles, normalizeRepositories, repositoryEndpoint } from '../lib/feeds';
import { profile } from '../lib/profile';
import { refreshContent } from '../lib/refresh-content';

const repositories = [{ id: 1, name: 'project', pushed_at: '2026-09-23T00:00:00Z', ignored: 'discard this' }];
const articles = [{ id: 2, title: 'Article', url: `${profile.dev}/article`, published_at: '2026-09-23T00:00:00Z' }];
const previous = JSON.stringify({ repositories, articles, updatedAt: '2020-01-01T00:00:00Z' });

async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-refresh-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'snapshot.json');
  await writeFile(file, previous);
  return { directory, file };
}

function responses(repoData: unknown = repositories, articleData: unknown = articles): typeof fetch {
  return async (input) => {
    assert.ok(input === repositoryEndpoint || input === articleEndpoint);
    return Response.json(input === repositoryEndpoint ? repoData : articleData);
  };
}

test('successful refresh saves a complete validated snapshot and removes temporary files', async (t) => {
  const { file, directory } = await fixture(t);
  const snapshot = await refreshContent({ file, fetcher: responses(), now: () => new Date('2026-09-24T00:00:00Z') });
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), snapshot);
  assert.equal(snapshot.updatedAt, '2026-09-24T00:00:00.000Z');
  assert.equal(normalizeRepositories(snapshot.repositories).length, 1);
  assert.equal(normalizeArticles(snapshot.articles).length, 1);
  assert.equal('ignored' in snapshot.repositories[0], false);
  assert.deepEqual(await readdir(directory), ['snapshot.json']);
});

for (const [label, repoData, articleData] of [
  ['ID-only repositories', [{ id: 1 }], articles],
  ['ID-only articles', repositories, [{ id: 1 }]],
  ['partially malformed responses', [...repositories, { id: 3 }], articles],
  ['duplicate IDs', [...repositories, ...repositories], articles],
  ['unsafe article URLs', repositories, [{ ...articles[0], url: 'https://evil.example/article' }]],
]) {
  test(`${label} leave the previous snapshot byte-for-byte unchanged`, async (t) => {
    const { file, directory } = await fixture(t);
    await assert.rejects(refreshContent({ file, fetcher: responses(repoData, articleData) }));
    assert.equal(await readFile(file, 'utf8'), previous);
    assert.deepEqual(await readdir(directory), ['snapshot.json']);
  });
}

test('one failed API preserves both feeds and the timestamp', async (t) => {
  const { file } = await fixture(t);
  const fetcher: typeof fetch = async (input) => input === articleEndpoint
    ? new Response(null, { status: 429 })
    : Response.json(repositories);
  await assert.rejects(refreshContent({ file, fetcher }), /429/);
  assert.equal(await readFile(file, 'utf8'), previous);
});

test('network failures, timeouts and invalid JSON preserve the snapshot', async (t) => {
  const { file } = await fixture(t);
  for (const fetcher of [
    async () => { throw new TypeError('Network unavailable'); },
    async () => { throw new DOMException('Timed out', 'TimeoutError'); },
    async () => new Response('not JSON'),
  ]) {
    await assert.rejects(refreshContent({ file, fetcher }));
    assert.equal(await readFile(file, 'utf8'), previous);
  }
});

test('legitimately empty accounts can replace older content', async (t) => {
  const { file } = await fixture(t);
  const snapshot = await refreshContent({ file, fetcher: responses([], []) });
  assert.deepEqual(snapshot.repositories, []);
  assert.deepEqual(snapshot.articles, []);
});

test('failed replacement cleans up its temporary file', async (t) => {
  const { directory, file } = await fixture(t);
  await assert.rejects(refreshContent({ file: directory, fetcher: responses() }));
  assert.equal(await readFile(file, 'utf8'), previous);
  const parent = join(directory, '..');
  assert.equal((await readdir(parent)).some((name) => name.startsWith(directory.split(/[\\/]/).at(-1) + '.') && name.endsWith('.tmp')), false);
});
