import { profile } from './profile';

export function parseSiteUrl(value: string): URL {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTP(S) origin without credentials, a path, query, or fragment.');
  }
  return url;
}

export const siteUrl = parseSiteUrl(process.env.SITE_URL ?? profile.siteUrl);
export const siteTitle = `${profile.name} — ${profile.role}`;
export const siteDescription = `${profile.name}. ${profile.bio}`;
