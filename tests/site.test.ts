import assert from 'node:assert/strict';
import test from 'node:test';
import { profile } from '../lib/profile';
import { parseSiteUrl, siteTitle } from '../lib/site';

test('profile links and page title derive from the configured identity', () => {
  assert.equal(profile.github, `https://github.com/${profile.githubUsername}`);
  assert.equal(profile.dev, `https://dev.to/${profile.devUsername}`);
  assert.equal(siteTitle, `${profile.name} — ${profile.role}`);
});

test('custom deployment origins are normalized and unsafe or unsupported URLs rejected', () => {
  assert.equal(parseSiteUrl('https://portfolio.example').href, 'https://portfolio.example/');
  for (const url of ['invalid', 'javascript:alert(1)', 'https://user:pass@example.com', 'https://example.com/path', 'https://example.com?x=1', 'https://example.com#section']) {
    assert.throws(() => parseSiteUrl(url));
  }
});
