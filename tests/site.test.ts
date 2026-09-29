import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSiteUrl } from '../lib/site';

test('custom deployment origins are normalized and unsafe or unsupported URLs rejected', () => {
  assert.equal(parseSiteUrl('https://portfolio.example').href, 'https://portfolio.example/');
  for (const url of [
    'invalid',
    'javascript:alert(1)',
    'https://user:pass@example.com',
    'https://example.com/path',
    'https://example.com?x=1',
    'https://example.com#section',
  ]) {
    assert.throws(() => parseSiteUrl(url));
  }
});
