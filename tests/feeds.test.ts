import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { formatDate, normalizeArticles, normalizeRepositories } from '../lib/feeds';
import { profile } from '../lib/profile';

const article = { id: 1, title: 'Article', url: `${profile.dev}/article`, published_at: '2026-09-23T12:00:00Z' };

test('the checked-in snapshot can render both feeds', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../data/public-content.json', import.meta.url), 'utf8'));
  assert.equal(normalizeRepositories(snapshot.repositories).length, snapshot.repositories.length);
  assert.equal(normalizeArticles(snapshot.articles).length, snapshot.articles.length);
});

test('malformed and ID-only responses fail validation', () => {
  for (const normalize of [normalizeRepositories, normalizeArticles]) {
    for (const input of [null, {}, 'wrong', [{ id: 1 }]]) assert.throws(() => normalize(input));
    assert.deepEqual(normalize([]), []);
  }
});

test('repositories are ordered by newest push without a pinned project', () => {
  const repos = normalizeRepositories([
    { id: 1, name: 'old', pushed_at: '2020-01-01' },
    { id: 2, name: 'recent', pushed_at: '2026-09-23' },
    { id: 3, name: 'Ananuri.SlotEngine', pushed_at: '2019-01-01' },
  ]);
  assert.deepEqual(repos.map(({ id }) => id), [2, 1, 3]);
});

test('live feeds tolerate bad records alongside valid ones', () => {
  assert.equal(normalizeRepositories([null, { id: 1, name: 'project' }]).length, 1);
  assert.equal(normalizeArticles([null, article]).length, 1);
});

test('repository names cannot escape their intended URL path', () => {
  for (const name of ['', ' ', '..', '.', '../other', 'a/b']) {
    assert.throws(() => normalizeRepositories([{ id: 1, name }]));
  }
  assert.equal(normalizeRepositories([{ id: 1, name: 'valid.repo-name' }])[0].url, `${profile.github}/valid.repo-name`);
});

test('articles require a valid date and an HTTPS URL belonging to the configured author', () => {
  for (const url of ['javascript:alert(1)', 'https://evil.example/a', 'http://dev.to/bsokur/a', 'https://dev.to/other/a', `${profile.dev}/`, 'https://user:pass@dev.to/bsokur/a']) {
    assert.throws(() => normalizeArticles([{ ...article, url }]));
  }
  assert.throws(() => normalizeArticles([{ ...article, published_at: 'invalid' }]));
  assert.throws(() => normalizeArticles([{ ...article, title: ' ' }]));
});

test('IDs must be positive safe integers and optional numbers remain finite', () => {
  for (const id of [NaN, Infinity, -1, 0, 1.5]) {
    assert.throws(() => normalizeRepositories([{ id, name: 'project' }]));
    assert.throws(() => normalizeArticles([{ ...article, id }]));
  }
  assert.equal(normalizeArticles([{ ...article, reading_time_minutes: Infinity }])[0].readingMinutes, 1);
  assert.equal(normalizeRepositories([{ id: 1, name: 'project', stargazers_count: -4 }])[0].stars, 0);
});

test('articles sort newest first and dates use UTC', () => {
  const items = normalizeArticles([article, { ...article, id: 2, published_at: '2026-09-24T00:00:00Z' }]);
  assert.deepEqual(items.map(({ id }) => id), [2, 1]);
  assert.equal(formatDate('2026-09-23T23:59:00Z'), '23 Sept 2026');
});
