import assert from 'node:assert/strict';
import test from 'node:test';
import { articleFeedMessage, articleFeedReducer, createArticleFeedState } from '../lib/feed-state';
import { type Article, normalizeRepositories } from '../lib/feeds';
import { createRepositoryFeedState, repositoryFeedReducer } from '../lib/repository-feed-state';

test('repository refresh preserves visible cards until accepted, including empty results', () => {
  const repositories = normalizeRepositories([{ id: 1, name: 'Project', description: 'Saved' }]);
  const initial = createRepositoryFeedState(repositories);
  const updated = repositories.map((repository) => ({ ...repository, description: 'Updated on GitHub' }));
  const pending = repositoryFeedReducer(initial, { type: 'loaded', items: updated });
  assert.deepEqual(pending.items, repositories);
  assert.deepEqual(pending.pending, updated);
  const applied = repositoryFeedReducer(pending, { type: 'apply' });
  assert.deepEqual(applied.items, updated);
  assert.equal(applied.appliedUpdate, true);
  assert.equal(repositoryFeedReducer(applied, { type: 'apply' }), applied);
  const empty = repositoryFeedReducer(applied, { type: 'loaded', items: [] });
  assert.deepEqual(empty.items, updated);
  assert.deepEqual(repositoryFeedReducer(empty, { type: 'apply' }).items, []);
});

test('repository failures retain saved data and empty lists can populate automatically', () => {
  const repositories = normalizeRepositories([{ id: 1, name: 'Project' }]);
  const initial = createRepositoryFeedState(repositories);
  const failed = repositoryFeedReducer(initial, { type: 'failed' });
  assert.deepEqual(failed.items, repositories);
  assert.equal(failed.status, 'error');
  const loaded = repositoryFeedReducer(createRepositoryFeedState([]), { type: 'loaded', items: repositories });
  assert.deepEqual(loaded.items, repositories);
  assert.equal(loaded.pending, null);
});

test('repository updates outside the three visible cards do not prompt a change', () => {
  const repositories = normalizeRepositories(Array.from({ length: 4 }, (_, index) => ({ id: index + 1, name: `Project${index}` })));
  const initial = createRepositoryFeedState(repositories);
  const updated = repositories.map((repository, index) => index === 3 ? { ...repository, stars: 100 } : repository);
  const loaded = repositoryFeedReducer(initial, { type: 'loaded', items: updated });
  assert.equal(initial.items.length, 3);
  assert.equal(loaded.items.length, 3);
  assert.equal(loaded.pending, null);
});

const savedAt = '2026-09-23T23:59:00Z';
const article: Article = {
  id: 1,
  title: 'Article',
  url: 'https://dev.to/bsokur/article',
  description: 'A saved description.',
  publishedAt: '2026-09-20T12:00:00Z',
  readingMinutes: 3,
  tags: ['dotnet'],
};

test('changed articles wait for explicit acceptance without moving the saved rows', () => {
  const initial = createArticleFeedState([article], savedAt);
  const changed = { ...article, title: 'Updated article' };
  const refreshed = articleFeedReducer(initial, { type: 'loaded', items: [changed] });
  assert.strictEqual(refreshed.items, initial.items);
  assert.deepEqual(refreshed.pending, [changed]);
  assert.equal(articleFeedMessage(refreshed), 'Updated articles are available.');

  const accepted = articleFeedReducer(refreshed, { type: 'apply' });
  assert.deepEqual(accepted.items, [changed]);
  assert.equal(accepted.pending, null);
  assert.equal(accepted.appliedUpdate, true);
  assert.equal(articleFeedMessage(accepted), 'Articles updated.');
  assert.strictEqual(articleFeedReducer(accepted, { type: 'apply' }), accepted);
});

test('changes to unrendered fields, hidden rows, or overridden descriptions do not offer an update', () => {
  const featured = { ...article, id: 4696556 };
  const items = [featured, { ...article, id: 2 }, { ...article, id: 3 }];
  const initial = createArticleFeedState(items, savedAt);
  const refreshed = articleFeedReducer(initial, {
    type: 'loaded',
    items: [{ ...featured, description: 'Not displayed', tags: ['changed'] }, items[1], items[2], { ...article, id: 4 }],
  });
  assert.strictEqual(refreshed.items, initial.items);
  assert.equal(refreshed.pending, null);
  assert.equal(articleFeedMessage(refreshed), '');
});

test('reordered articles also wait for acceptance', () => {
  const second = { ...article, id: 2, title: 'Second article', url: 'https://dev.to/bsokur/second' };
  const initial = createArticleFeedState([article, second], savedAt);
  const refreshed = articleFeedReducer(initial, { type: 'loaded', items: [second, article] });
  assert.deepEqual(refreshed.items, [article, second]);
  assert.deepEqual(refreshed.pending, [second, article]);
});

test('an empty successful refresh cannot remove existing articles without acceptance', () => {
  const refreshed = articleFeedReducer(createArticleFeedState([article], savedAt), { type: 'loaded', items: [] });
  assert.deepEqual(refreshed.items, [article]);
  assert.deepEqual(refreshed.pending, []);
  const accepted = articleFeedReducer(refreshed, { type: 'apply' });
  assert.deepEqual(accepted.items, []);
  assert.equal(accepted.appliedUpdate, true);
  assert.equal(articleFeedMessage(accepted), 'No articles to display here.');
});

test('an initially empty list can populate immediately and a successful empty result ends loading', () => {
  const initial = createArticleFeedState([], savedAt);
  assert.equal(articleFeedMessage(initial), 'Loading articles…');
  const populated = articleFeedReducer(initial, { type: 'loaded', items: [article] });
  assert.deepEqual(populated.items, [article]);
  assert.equal(populated.pending, null);
  assert.equal(articleFeedMessage(populated), 'Latest articles loaded.');
  const empty = articleFeedReducer(initial, { type: 'loaded', items: [] });
  assert.equal(empty.status, 'ready');
  assert.equal(articleFeedMessage(empty), 'No articles to display here.');
});

test('failed refreshes preserve the saved articles and expose their actual saved date', () => {
  const initial = createArticleFeedState([article], savedAt);
  const failed = articleFeedReducer(initial, { type: 'failed' });
  assert.strictEqual(failed.items, initial.items);
  assert.equal(failed.savedAt, savedAt);
  assert.equal(articleFeedMessage(failed), 'Latest articles couldn’t be loaded. Showing articles saved 23 Sept 2026.');
  const empty = articleFeedReducer(createArticleFeedState([], savedAt), { type: 'failed' });
  assert.equal(articleFeedMessage(empty), 'Latest articles couldn’t be loaded. The saved list from 23 Sept 2026 has no articles.');
});
