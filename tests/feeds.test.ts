import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeArticles, normalizeRepositories } from '../lib/feeds';
import { profile } from '../lib/profile';

const article = {
  id: 1,
  title: 'Article',
  url: `${profile.dev}/article`,
  published_at: '2026-09-23T12:00:00Z',
};

test('malformed and ID-only responses fail validation', () => {
  for (const normalize of [normalizeRepositories, normalizeArticles]) {
    for (const input of [null, {}, 'wrong', [{ id: 1 }]]) assert.throws(() => normalize(input));
  }
});

test('live feeds tolerate bad records alongside valid ones', () => {
  assert.equal(normalizeRepositories([null, { id: 1, name: 'project' }]).length, 1);
  assert.equal(normalizeArticles([null, article]).length, 1);
});

test('repository names cannot escape their intended URL path', () => {
  for (const name of ['', ' ', '..', '.', '../other', 'a/b']) {
    assert.throws(() => normalizeRepositories([{ id: 1, name }]));
  }
  assert.equal(
    normalizeRepositories([{ id: 1, name: 'valid.repo-name' }])[0].url,
    `${profile.github}/valid.repo-name`,
  );
});

test('articles require a valid date and an HTTPS URL belonging to the configured author', () => {
  for (const url of [
    'javascript:alert(1)',
    'https://evil.example/a',
    'http://dev.to/bsokur/a',
    'https://dev.to/other/a',
    `${profile.dev}/`,
    'https://user:pass@dev.to/bsokur/a',
  ]) {
    assert.throws(() => normalizeArticles([{ ...article, url }]));
  }
  assert.throws(() => normalizeArticles([{ ...article, published_at: 'invalid' }]));
  assert.throws(() => normalizeArticles([{ ...article, title: ' ' }]));
});
