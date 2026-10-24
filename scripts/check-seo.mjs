import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { publicPaths, redirectPaths, getSeo, serializeJson } from '../dist-ssr/entry-server.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const titles = new Set();
const descriptions = new Set();
const expectedTitles = new Map();
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, publicPaths.length);
for (const pathname of publicPaths) {
  const filename = path.join(root, pathname === '/' ? 'index.html' : `${pathname.slice(1)}/index.html`);
  const html = await readFile(filename, 'utf8');
  const head = html.split('</head>')[0];
  const body = html.split('<div id="root">')[1]?.split('<script id="site-content"')[0];
  assert(body?.length > 1000, `${pathname}: missing prerendered body`);
  assert.equal((body.match(/<h1(?:\s|>)/g) || []).length, 1, `${pathname}: must have one h1`);
  assert(!/<h1[^>]*style="[^"]*opacity:0(?:;|")/.test(body), `${pathname}: h1 is hidden before JavaScript`);
  assert.equal((head.match(/<title>/g) || []).length, 1);
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1);
  const title = head.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = head.match(/name="description" content="([^"]+)"/)?.[1];
  assert(title && !titles.has(title), `${pathname}: duplicate/missing title`);
  assert(description && !descriptions.has(description), `${pathname}: duplicate/missing description`);
  titles.add(title); descriptions.add(description);
  expectedTitles.set(pathname, title);
  assert(head.includes(`href="https://bkntech.fr${pathname}"`), `${pathname}: wrong canonical`);
  assert(head.includes('index, follow, max-image-preview:large'));
  assert(!head.includes('noindex'));
  assert(sitemap.includes(`<loc>https://bkntech.fr${pathname}</loc>`));
  assert(!head.includes('<!--seo-head-->'));
  assert(body.includes('href="/contact"'), `${pathname}: missing contact link`);
  const data = JSON.parse(head.match(/<script id="seo-structured-data" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert(data['@graph'].some(item => item['@type'] === 'Organization'));
  assert(data['@graph'].some(item => item.url === `https://bkntech.fr${pathname}`));
  if (pathname.startsWith('/services/')) {
    assert(data['@graph'].some(item => item['@type'] === 'Service'));
    assert(body.includes('tel:+33661201418'));
  }
  const snapshot = JSON.parse(html.match(/<script id="site-content" type="application\/json">(.*?)<\/script>/s)[1]);
  assert(Object.keys(snapshot.settings).every(key => ['featuredBannerUrl', 'devlogBannerUrl'].includes(key)), `${pathname}: unexpected settings exposed`);
  // Check public internal document links resolve to generated pages, including fragments.
  for (const match of body.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const target = match[1];
    if (target.startsWith('/uploads/') || /\.[a-z0-9]+$/i.test(target)) continue;
    assert(publicPaths.includes(target) || target === '/portfolio/admin', `${pathname}: unknown internal link ${target}`);
  }
  assert.notEqual(getSeo(pathname, 'en').title, getSeo(pathname, 'fr').title, `${pathname}: missing English metadata`);
}
for (const file of ['404.html', 'portfolio/admin/index.html']) {
  const html = await readFile(path.join(root, file), 'utf8');
  assert(html.includes('content="noindex, follow"'), `${file}: missing noindex`);
}
assert(!sitemap.includes('/portfolio/admin'));
assert(!sitemap.includes('/404'));
assert(!sitemap.includes('<lastmod>'));
assert.equal(getSeo('/portfolio/section/unknown').robots, 'noindex, follow');
assert.equal(getSeo('/services/unknown').robots, 'noindex, follow');
assert(!serializeJson({ text: '</script><script>alert(1)</script>' }).includes('<'));
const image = await stat(path.join(root, 'og-bkn-tech.png'));
assert(image.size > 1000);
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
assert(robots.includes('User-agent: *'));
assert(!/^Disallow:\s*\//m.test(robots), 'Search and rendering resources must stay crawlable');
console.log(`SEO checks passed: ${publicPaths.length} HTML pages, unique metadata, canonical URLs, JSON-LD, links, sitemap, robots, admin and 404 noindex.`);

// Optional read-only HTTP verification against a running preview/deployment.
if (process.argv[2]) {
  const base = new URL(process.argv[2]);
  for (const pathname of publicPaths) {
    const response = await fetch(new URL(pathname, base));
    assert.equal(response.status, 200, `${pathname}: expected HTTP 200`);
    const html = await response.text();
    assert.equal(html.match(/<title>(.*?)<\/title>/s)?.[1], expectedTitles.get(pathname), `${pathname}: server returned the wrong document`);
    assert(html.includes(`href="https://bkntech.fr${pathname}"`));
  }
  const unknown = await fetch(new URL('/seo-check-page-inexistante', base));
  assert.equal(unknown.status, 404, 'Unknown page must return HTTP 404');
  assert((await unknown.text()).includes('content="noindex, follow"'));
  for (const [from, to] of Object.entries(redirectPaths)) {
    const response = await fetch(new URL(from, base), { redirect: 'manual' });
    assert.equal(response.status, 301, `${from}: expected a permanent redirect`);
    assert.equal(new URL(response.headers.get('location'), base).href, new URL(to, base).href);
  }
  const admin = await fetch(new URL('/portfolio/admin', base), { method: 'HEAD' });
  assert.equal(admin.headers.get('x-robots-tag'), 'noindex, follow');
  console.log(`HTTP checks passed: ${publicPaths.length} direct HTML responses, 404, redirects and admin noindex on ${base.origin}.`);
}
