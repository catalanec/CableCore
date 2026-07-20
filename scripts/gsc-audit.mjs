import { google } from 'googleapis';
import { readFileSync } from 'fs';

const SITE_URL = 'https://cablecore.es/';
const KEY_FILE = new URL('../gsc-credentials.json', import.meta.url).pathname;

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const sc = google.searchconsole({ version: 'v1', auth });

  // 1. Coverage / indexing issues
  console.log('\n=== INDEXING STATUS ===');
  const inspection = await sc.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: 'https://cablecore.es/es/',
      siteUrl: SITE_URL,
    },
  }).catch(e => null);

  if (inspection) {
    const r = inspection.data.inspectionResult;
    console.log('Homepage /es/ verdict:', r.indexStatusResult?.verdict);
    console.log('Coverage state:', r.indexStatusResult?.coverageState);
  }

  // 2. Search Analytics — top pages by clicks (last 28 days)
  const today = new Date();
  const from = new Date(today - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const to = today.toISOString().split('T')[0];

  console.log(`\n=== TOP PAGES (${from} → ${to}) ===`);
  const analytics = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: from,
      endDate: to,
      dimensions: ['page'],
      rowLimit: 20,
      orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
    },
  });

  const rows = analytics.data.rows || [];
  if (rows.length === 0) {
    console.log('No data yet');
  } else {
    rows.forEach(r => {
      console.log(`${r.keys[0].replace('https://cablecore.es', '')} — clicks: ${r.clicks}, impressions: ${r.impressions}, pos: ${r.position?.toFixed(1)}`);
    });
  }

  // 3. Top queries
  console.log(`\n=== TOP QUERIES ===`);
  const queries = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: from,
      endDate: to,
      dimensions: ['query'],
      rowLimit: 20,
      orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
    },
  });

  (queries.data.rows || []).forEach(r => {
    console.log(`"${r.keys[0]}" — clicks: ${r.clicks}, impressions: ${r.impressions}, pos: ${r.position?.toFixed(1)}`);
  });

  // 4. Pages with 0 clicks but high impressions (SEO opportunities)
  console.log('\n=== SEO OPPORTUNITIES (high impressions, 0 clicks) ===');
  const all = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: from,
      endDate: to,
      dimensions: ['query'],
      rowLimit: 100,
      orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
    },
  });

  (all.data.rows || [])
    .filter(r => r.clicks === 0 && r.impressions >= 10)
    .slice(0, 10)
    .forEach(r => {
      console.log(`"${r.keys[0]}" — impressions: ${r.impressions}, pos: ${r.position?.toFixed(1)}`);
    });
}

main().catch(console.error);
