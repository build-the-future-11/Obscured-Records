import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeSiteOrigin, serializeJsonLd, escapeXml, isRecentPublication, buildRss, buildNewsSitemap } from '../lib/discovery.ts';
import { toIsoEditorialDate, toRssEditorialDate } from '../lib/editorial-dates.ts';

test('canonical HTTPS origin is normalized', () => assert.equal(normalizeSiteOrigin(' https://Example.COM/ '), 'https://example.com'));
for (const bad of ['ftp://example.com', 'http://example.com', 'https://a:b@example.com', 'https://example.com/path', 'https://example.com/?q=x', 'https://example.com/#x', '//example.com', 'not a URL']) {
  test(`rejects unsafe canonical config: ${bad}`, () => assert.throws(() => normalizeSiteOrigin(bad)));
}
for (const origin of ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000']) {
  test(`accepts explicit loopback development: ${origin}`, () => assert.equal(normalizeSiteOrigin(origin), origin));
}
test('JSON-LD cannot close a script element and round-trips data', () => {
  const data = { headline: '</script><script>alert(1)</script>', separator: '\u2028\u2029' };
  const encoded = serializeJsonLd(data);
  assert.ok(!encoded.includes('<')); assert.ok(!encoded.includes('\u2028'));
  assert.deepEqual(JSON.parse(encoded), data);
});
test('XML encodes text, attributes and CDATA terminators safely', () => {
  assert.equal(escapeXml(`<x a="b">&']]></x>\u0000`), '&lt;x a=&quot;b&quot;&gt;&amp;&apos;]]&gt;&lt;/x&gt;');
});
for (const [human, iso] of [['14 Sep 2026', '2026-09-14'], ['1 Jan 2026', '2026-01-01'], ['29 Feb 2024', '2024-02-29'], ['2026-09-26', '2026-09-26']]) {
  test(`normalizes real date ${human}`, () => assert.equal(toIsoEditorialDate(human), iso));
}
for (const invalid of ['29 Feb 2026', '31 Apr 2026', '00 Jan 2026', '2026-13-01', '2026-02-30', '26 Sept 2026', 'tomorrow']) {
  test(`rejects invalid date ${invalid}`, () => assert.throws(() => toIsoEditorialDate(invalid)));
}
test('RSS date is UTC and tied to the actual record date', () => assert.equal(toRssEditorialDate('14 Sep 2026'), 'Mon, 14 Sep 2026 00:00:00 GMT'));
const now = Date.parse('2026-09-26T00:00:00Z');
test('news window includes exact lower bound', () => assert.equal(isRecentPublication('2026-09-24', now), true));
test('news window removes old entries as time advances', () => assert.equal(isRecentPublication('2026-09-24', now + 1), false));
test('news window excludes future publications', () => assert.equal(isRecentPublication('2026-09-27', now), false));
test('news window rejects normalized invalid dates', () => assert.equal(isRecentPublication('2026-02-30', now), false));
const records = [
  { slug: 'old', title: 'Old', excerpt: 'before', publishedIso: '2026-09-14' },
  { slug: 'new', title: 'New & <safe>', excerpt: 'a ]]> b', publishedIso: '2026-09-26' },
  { slug: 'future', title: 'Future', excerpt: 'later', publishedIso: '2026-09-27' },
];
test('RSS includes every supplied public record without invalid CDATA', () => {
  const xml = buildRss('https://example.com', records);
  assert.equal((xml.match(/<item>/g) || []).length, 3);
  assert.match(xml, /New &amp; &lt;safe&gt;/); assert.ok(!xml.includes(']]>'));
  assert.match(xml, /Mon, 14 Sep 2026 00:00:00 GMT/);
  assert.ok(xml.indexOf('/article/future') < xml.indexOf('/article/old'));
});
test('news sitemap contains only current records and escapes their titles', () => {
  const xml = buildNewsSitemap('https://example.com', records, now);
  assert.equal((xml.match(/<url>/g) || []).length, 1);
  assert.match(xml, /\/article\/new/); assert.doesNotMatch(xml, /\/article\/(old|future)/);
  assert.match(xml, /New &amp; &lt;safe&gt;/);
});
test('news sitemap empties without a rebuild', () => assert.ok(!buildNewsSitemap('https://example.com', records, now + 7 * 86400000).includes('<url>')));
