import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
// A separate server bundle is used only at build time, never deployed as an API.
await build({
  configFile: false, root, publicDir: false, plugins: [react()],
  build: { ssr: 'src/entry-server.jsx', outDir: 'dist-ssr' },
});
const { render, publicPaths, redirectPaths, getSeo, renderSeoTags, serializeJson } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')));
const template = await readFile(path.join(root, 'dist/index.html'), 'utf8');
const posts = JSON.parse(await readFile(path.join(root, 'api/posts.json'), 'utf8'));
const rawSettings = JSON.parse(await readFile(path.join(root, 'api/settings.json'), 'utf8'));
const settings = Object.fromEntries(['featuredBannerUrl', 'devlogBannerUrl']
  .filter(key => typeof rawSettings[key] === 'string')
  .map(key => [key, rawSettings[key]]));
const pageFile = pathname => path.join(root, 'dist', pathname === '/' ? 'index.html' : `${pathname.slice(1)}/index.html`);

for (const pathname of [...publicPaths, '/portfolio/admin', '/404']) {
  // Snapshot only the public data needed by this route. Live API refresh stays enabled.
  const content = pathname.startsWith('/portfolio') && pathname !== '/portfolio/admin' ? { posts, settings } : { settings };
  const markup = pathname === '/portfolio/admin' ? '<p>Administration BKN Tech</p>' : render(pathname, content);
  const html = template.replace('<!--seo-head-->', renderSeoTags(getSeo(pathname)))
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>\n<script id="site-content" type="application/json">${serializeJson(content)}</script>`);
  const target = pathname === '/404' ? path.join(root, 'dist/404.html') : pageFile(pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}

// A sitemap has only canonical, indexable pages. Do not fabricate lastmod dates.
await writeFile(path.join(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map(route => `  <url><loc>https://bkntech.fr${route}</loc></url>`).join('\n')}\n</urlset>\n`);

// Portable fallbacks for static preview hosts; production redirects use HTTP 301.
for (const [from, to] of Object.entries(redirectPaths)) {
  const target = pageFile(from);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `<!doctype html><html lang="fr"><head><meta charset="UTF-8"><meta name="robots" content="noindex, follow"><link rel="canonical" href="${to.startsWith('https:') ? to : `https://bkntech.fr${to}`}"><meta http-equiv="refresh" content="0;url=${to}"><title>Redirection | BKN Tech</title></head><body><a href="${to}">Continuer</a></body></html>`);
}

// A real raster sharing image, generated deterministically from the existing brand.
const logo = await sharp(path.join(root, 'public/BknLogo.svg')).resize(180, 180).png().toBuffer();
const card = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#12131b"/><path d="M70 510H1130" stroke="#4edea3" stroke-width="3"/><text x="300" y="260" fill="#bec2ff" font-size="82" font-weight="700" font-family="sans-serif">BKN Tech</text><text x="80" y="400" fill="#e3e1ed" font-size="40" font-family="sans-serif">Web · Mobile · IA · Unity</text><text x="80" y="560" fill="#ababcf" font-size="28" font-family="sans-serif">bkntech.fr · Paris</text></svg>`);
await sharp(card).composite([{ input: logo, left: 80, top: 120 }]).png().toFile(path.join(root, 'dist/og-bkn-tech.png'));
console.log(`Prerender: ${publicPaths.length} public pages, admin noindex, 404, sitemap and sharing image generated.`);
