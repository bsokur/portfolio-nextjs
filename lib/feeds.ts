import { profile } from './profile';

export type Repository = {
  id: number;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  fork: boolean;
  archived: boolean;
  pushedAt: string;
};

export type Article = {
  id: number;
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
};

type RecordValue = Record<string, unknown>;
const isRecord = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const isDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
const isId = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function normalizeRepositories(input: unknown): Repository[] {
  if (!Array.isArray(input)) throw new Error('Invalid repository response');
  const repositories = input.flatMap((item) => {
    if (!isRecord(item) || !isId(item.id) || !isText(item.name) || !/^[\w.-]+$/.test(item.name) || /^\.{1,2}$/.test(item.name)) return [];
    return [{
      id: item.id,
      name: item.name,
      url: `${profile.github}/${encodeURIComponent(item.name)}`,
      description: typeof item.description === 'string' ? item.description : null,
      language: typeof item.language === 'string' ? item.language : null,
      stars: typeof item.stargazers_count === 'number' && Number.isFinite(item.stargazers_count) ? Math.max(0, Math.floor(item.stargazers_count)) : 0,
      fork: item.fork === true,
      archived: item.archived === true,
      pushedAt: isDate(item.pushed_at) ? item.pushed_at : '1970-01-01T00:00:00Z',
    }];
  });
  if (input.length && !repositories.length) throw new Error('No valid repositories in response');
  return repositories.sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
}

export function normalizeArticles(input: unknown): Article[] {
  if (!Array.isArray(input)) throw new Error('Invalid article response');
  const articles = input.flatMap((item) => {
    if (!isRecord(item) || !isId(item.id) || !isText(item.title) || typeof item.url !== 'string' || !isDate(item.published_at)) return [];
    let url: URL;
    try { url = new URL(item.url); } catch { return []; }
    const authorPath = `/${encodeURIComponent(profile.devUsername)}/`;
    if (url.origin !== 'https://dev.to' || url.username || url.password || !url.pathname.startsWith(authorPath) || url.pathname.length <= authorPath.length) return [];
    return [{
      id: item.id,
      title: item.title,
      url: url.href,
      description: typeof item.description === 'string' ? item.description : '',
      publishedAt: item.published_at,
      readingMinutes: typeof item.reading_time_minutes === 'number' && Number.isFinite(item.reading_time_minutes) ? Math.max(1, Math.ceil(item.reading_time_minutes)) : 1,
      tags: Array.isArray(item.tag_list) ? item.tag_list.filter((tag): tag is string => typeof tag === 'string') : [],
    }];
  });
  if (input.length && !articles.length) throw new Error('No valid articles in response');
  return articles.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export const repositoryEndpoint = `https://api.github.com/users/${encodeURIComponent(profile.githubUsername)}/repos?per_page=100&sort=pushed&direction=desc&type=owner`;
export const articleEndpoint = `https://dev.to/api/articles?username=${encodeURIComponent(profile.devUsername)}&per_page=10`;

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}
