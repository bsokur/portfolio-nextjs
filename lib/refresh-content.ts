import { randomUUID } from 'node:crypto';
import { rename, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { articleEndpoint, normalizeArticles, normalizeRepositories, repositoryEndpoint } from './feeds';

type RefreshOptions = {
  file: string | URL;
  fetcher?: typeof fetch;
  now?: () => Date;
};

const repositoryFields = ['id', 'name', 'description', 'language', 'stargazers_count', 'fork', 'archived', 'pushed_at'];
const articleFields = ['id', 'title', 'url', 'description', 'published_at', 'reading_time_minutes', 'tag_list'];

async function fetchFeed<T extends { id: number }>(
  endpoint: string,
  normalize: (input: unknown) => T[],
  fields: string[],
  fetcher: typeof fetch,
) {
  const response = await fetcher(endpoint, {
    headers: { Accept: 'application/json', 'User-Agent': 'PortfolioSnapshot/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Feed unavailable (${response.status}): ${endpoint}`);
  const input: unknown = await response.json();
  const normalized = normalize(input);
  // A live feed can skip a bad record; a saved fallback must be complete and valid.
  if (!Array.isArray(input) || normalized.length !== input.length || new Set(normalized.map(({ id }) => id)).size !== input.length) {
    throw new Error(`Invalid or duplicate records: ${endpoint}`);
  }
  return input.map((item: Record<string, unknown>) => Object.fromEntries(fields.map((field) => [field, item[field] ?? null])));
}

export async function refreshContent({ file, fetcher = fetch, now = () => new Date() }: RefreshOptions) {
  const [repositories, articles] = await Promise.all([
    fetchFeed(repositoryEndpoint, normalizeRepositories, repositoryFields, fetcher),
    fetchFeed(articleEndpoint, normalizeArticles, articleFields, fetcher),
  ]);
  const snapshot = { repositories, articles, updatedAt: now().toISOString() };
  const destination = file instanceof URL ? fileURLToPath(file) : file;
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    // Rename within the same directory so readers never see a partially written snapshot.
    await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
    await rename(temporary, destination);
  } finally {
    await rm(temporary, { force: true });
  }
  return snapshot;
}
