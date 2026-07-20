import { google } from 'googleapis';

const SITE_URL = 'https://cablecore.es/';
const KEY_FILE = new URL('../gsc-credentials.json', import.meta.url).pathname;

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

const sc = google.searchconsole({ version: 'v1', auth });

const today = new Date();
const from = new Date(today - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const to = today.toISOString().split('T')[0];

const analytics = await sc.searchanalytics.query({
  siteUrl: SITE_URL,
  requestBody: { startDate: from, endDate: to, dimensions: ['page'], rowLimit: 100,
    orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }] },
});

console.log('\n=== ALL PAGES (90 days) ===');
console.log('PAGE | CLICKS | IMPRESSIONS | CTR | POSITION');
for (const r of analytics.data.rows || []) {
  const page = r.keys[0].replace('https://cablecore.es', '') || '/';
  console.log(`${page} | ${r.clicks} | ${r.impressions} | ${(r.ctr*100).toFixed(1)}% | ${r.position?.toFixed(1)}`);
}

const pages = [
  'https://cablecore.es/es/',
  'https://cablecore.es/es/servicios/instalacion-red-barcelona',
  'https://cablecore.es/es/servicios/instalacion-cable-red-barcelona',
  'https://cablecore.es/es/blog/cat6-vs-cat6a-vs-cat7-diferencias',
  'https://cablecore.es/es/blog/puntos-de-red-precio-guia',
];

console.log('\n=== URL INSPECTION ===');
for (const url of pages) {
  try {
    const r = await sc.urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: SITE_URL },
    });
    const res = r.data.inspectionResult;
    const idx = res.indexStatusResult;
    console.log(`${url.replace('https://cablecore.es','')}`);
    console.log(`  verdict: ${idx?.verdict} | coverage: ${idx?.coverageState} | lastCrawl: ${idx?.lastCrawlTime}`);
  } catch(e) {
    console.log(`${url} → ERROR: ${e.message}`);
  }
}
