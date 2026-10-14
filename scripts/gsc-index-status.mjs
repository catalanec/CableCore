// Estado de indexación de todas las URL del sitemap + tráfico 28 días vs 28 anteriores.
import { google } from 'googleapis';

const SITE_URL = 'https://cablecore.es/';
const KEY_FILE = new URL('../gsc-credentials.json', import.meta.url).pathname;
const DATA_LAG_DAYS = 3; // los últimos días de GSC siempre salen incompletos
const auth = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
const sc = google.searchconsole({ version: 'v1', auth });

const day = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
async function totals(from, to, dimensions = []) {
  const r = await sc.searchanalytics.query({ siteUrl: SITE_URL, requestBody: { startDate: from, endDate: to, dimensions, rowLimit: 500 } });
  return r.data.rows || [];
}
const cur = await totals(day(DATA_LAG_DAYS + 27), day(DATA_LAG_DAYS));
const prev = await totals(day(DATA_LAG_DAYS + 55), day(DATA_LAG_DAYS + 28));
const fmt = (r) => r ? `clicks ${r.clicks}, impr ${r.impressions}, pos ${r.position.toFixed(1)}` : 'sin datos';
console.log(`TRAFICO ${day(DATA_LAG_DAYS + 27)}..${day(DATA_LAG_DAYS)}: ${fmt(cur[0])}`);
console.log(`ANTERIOR ${day(DATA_LAG_DAYS + 55)}..${day(DATA_LAG_DAYS + 28)}: ${fmt(prev[0])}`);
const pagesCur = await totals(day(DATA_LAG_DAYS + 27), day(DATA_LAG_DAYS), ['page']);
console.log(`PAGINAS CON IMPRESIONES (28d): ${pagesCur.length}`);
for (const r of pagesCur.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 12))
  console.log(`  ${r.keys[0].replace('https://cablecore.es', '')} | ${r.clicks} | ${r.impressions} | ${r.position.toFixed(1)}`);

const xml = await (await fetch('https://cablecore.es/sitemap.xml')).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`SITEMAP: ${urls.length} URL`);
const byState = {};
for (const url of urls) {
  try {
    const r = await sc.urlInspection.index.inspect({ requestBody: { inspectionUrl: url, siteUrl: SITE_URL } });
    const ix = r.data.inspectionResult?.indexStatusResult || {};
    const key = ix.coverageState || 'desconocido';
    (byState[key] ||= []).push(`${url.replace('https://cablecore.es', '')} (crawl ${ix.lastCrawlTime?.slice(0, 10) || '—'}${ix.googleCanonical && ix.googleCanonical !== url ? `, canonical Google ${ix.googleCanonical}` : ''})`);
  } catch (e) {
    (byState['ERROR API'] ||= []).push(`${url}: ${e.message}`);
  }
}
for (const [state, list] of Object.entries(byState).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n== ${state}: ${list.length}`);
  for (const u of list) console.log('  ' + u);
}
