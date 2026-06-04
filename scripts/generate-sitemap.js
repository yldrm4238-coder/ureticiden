import fs from 'fs';
import path from 'path';

// Bu script sitemap.xml dosyasını otomatik olarak oluşturur.
// Canlı domain'i buraya yazıyoruz:
const DOMAIN = 'https://ureticiden.com';

const routes = [
  '/',
  '/pazar',
  '/hakkimizda',
  '/iletisim',
  '/giris',
  '/kayit',
];

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(
      (route) => `
  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  const publicPath = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }

  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Sitemap successfully generated at public/sitemap.xml');
};

generateSitemap();
