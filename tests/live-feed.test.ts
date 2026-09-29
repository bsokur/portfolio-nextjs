import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchLiveFeed, liveFeedReducer, type LiveFeedState } from '../lib/live-feed';
import {
  articleEndpoint,
  normalizeArticles,
  normalizeRepositories,
  repositoryEndpoint,
} from '../lib/feeds';
import { profile } from '../lib/profile';

test('each load requests fresh data without browser caching or credentials', async () => {
  let calls = 0;
  const controller = new AbortController();
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(url, repositoryEndpoint);
    assert.equal(options?.cache, 'no-store');
    assert.equal(options?.credentials, 'omit');
    assert.equal(options?.signal, controller.signal);
    return Response.json([{ id: ++calls, name: `Latest-${calls}` }]);
  };
  const first = await fetchLiveFeed(
    repositoryEndpoint,
    normalizeRepositories,
    controller.signal,
    fetcher,
  );
  const second = await fetchLiveFeed(
    repositoryEndpoint,
    normalizeRepositories,
    controller.signal,
    fetcher,
  );
  assert.equal(first[0].name, 'Latest-1');
  assert.equal(second[0].name, 'Latest-2');
});

test('loads the latest three repositories and articles directly from the API response', async () => {
  const signal = new AbortController().signal;
  const repositories = Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    name: `Repo-${index}`,
    pushed_at: `2026-09-${20 + index}`,
  }));
  const repos = await fetchLiveFeed(repositoryEndpoint, normalizeRepositories, signal, async () =>
    Response.json(repositories),
  );
  assert.deepEqual(
    repos.map((repo) => repo.id),
    [4, 3, 2],
  );
  const articles = repositories.map((repo) => ({
    id: repo.id,
    title: repo.name,
    description: 'Fresh API description',
    url: `${profile.dev}/post-${repo.id}`,
    published_at: repo.pushed_at,
  }));
  const posts = await fetchLiveFeed(articleEndpoint, normalizeArticles, signal, async () =>
    Response.json(articles),
  );
  assert.deepEqual(
    posts.map((post) => post.id),
    [4, 3, 2],
  );
  assert.equal(posts[0].description, 'Fresh API description');
});

test('HTTP errors and invalid responses fail instead of returning stale content', async () => {
  const signal = new AbortController().signal;
  for (const response of [
    new Response(null, { status: 429 }),
    new Response('bad json'),
    Response.json({ error: 'bad response' }),
  ]) {
    await assert.rejects(
      fetchLiveFeed(repositoryEndpoint, normalizeRepositories, signal, async () => response),
    );
  }
});

test('results display immediately and retry clears errors before loading', () => {
  const initial: LiveFeedState<number> = { items: [], status: 'loading', attempt: 0 };
  const loaded = liveFeedReducer(initial, { type: 'loaded', items: [1] });
  assert.deepEqual(loaded.items, [1]);
  assert.equal(loaded.status, 'ready');
  const failed = liveFeedReducer(loaded, { type: 'failed' });
  assert.deepEqual(failed.items, []);
  assert.equal(failed.status, 'error');
  const retry = liveFeedReducer(failed, { type: 'retry' });
  assert.deepEqual(retry, { items: [], status: 'loading', attempt: 1 });
  assert.deepEqual(liveFeedReducer(retry, { type: 'loaded', items: [5] }).items, [5]);
});

test('empty API responses produce an empty ready feed', async () => {
  const items = await fetchLiveFeed(
    articleEndpoint,
    normalizeArticles,
    new AbortController().signal,
    async () => Response.json([]),
  );
  assert.deepEqual(
    liveFeedReducer({ items: [], status: 'loading', attempt: 0 }, { type: 'loaded', items }),
    { items: [], status: 'ready', attempt: 0 },
  );
});
