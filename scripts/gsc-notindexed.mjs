import { google } from 'googleapis';
import { readFileSync } from 'node:fs';

const SITE = 'https://cablecore.es/';
const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/antonshapoval/Developer/Projects/CableCore/gsc-credentials.json',
  scopes: ['https://www.googleapis.com/auth/webmasters'],
});
const sc = google.searchconsole({ version: 'v1', auth });

// every URL the site publishes, straight from the sitemap
const xml = await (await fetch('https://cablecore.es/sitemap.xml')).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log('URL в sitemap:', urls.length);

const buckets = {};
const notIndexed = [];
let done = 0;
for (const url of urls) {
  try {
    const r = await sc.urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: SITE },
    });
    const idx = r.data.inspectionResult?.indexStatusResult || {};
    const state = idx.coverageState || 'unknown';
    buckets[state] = (buckets[state] || 0) + 1;
    if (/not indexed|Discovered|Excluded|Duplicate|Alternate|redirect/i.test(state)) {
      notIndexed.push({ url, state, verdict: idx.verdict, canonical: idx.googleCanonical, user: idx.userCanonical, crawled: idx.lastCrawlTime });
    }
  } catch (e) {
    buckets['ERROR ' + (e.code || e.message)] = (buckets['ERROR'] || 0) + 1;
  }
  if (++done % 25 === 0) console.error(`  ...${done}/${urls.length}`);
  await new Promise(r => setTimeout(r, 120));
}

console.log('\n=== СВОДКА ===');
for (const [k, v] of Object.entries(buckets).sort((a,b)=>b[1]-a[1])) console.log(`${String(v).padStart(4)}  ${k}`);
console.log('\n=== НЕ В ИНДЕКСЕ ===');
for (const n of notIndexed) {
  console.log(`\n${n.url}`);
  console.log(`   состояние: ${n.state}`);
  console.log(`   canonical Google: ${n.canonical || '—'}`);
  console.log(`   canonical наш:    ${n.user || '—'}`);
  console.log(`   последний обход:  ${n.crawled || '—'}`);
}
