#!/bin/bash
# Ping search engines about sitemap updates
# Run after every deploy: bash scripts/ping-search-engines.sh

SITEMAP_URL="https://cablecore.es/sitemap.xml"
SITE_URL="https://cablecore.es"

echo "🔍 Pinging search engines about sitemap update..."

# Google
echo -n "  Google: "
curl -s -o /dev/null -w '%{http_code}' "https://www.google.com/ping?sitemap=${SITEMAP_URL}"
echo ""

# Bing (also covers Yahoo)
echo -n "  Bing:   "
curl -s -o /dev/null -w '%{http_code}' "https://www.bing.com/ping?sitemap=${SITEMAP_URL}"
echo ""

# IndexNow for Bing/Yandex — submit key URLs
INDEXNOW_KEY="cablecore2026indexnow"
KEY_URLS=(
  "${SITE_URL}/es"
  "${SITE_URL}/es/servicios"
  "${SITE_URL}/es/calculator"
  "${SITE_URL}/es/blog"
  "${SITE_URL}/es/contacto"
  "${SITE_URL}/es/servicios/instalacion-red-barcelona"
  "${SITE_URL}/es/servicios/cableado-estructurado-barcelona"
  "${SITE_URL}/es/servicios/instalacion-red-hospitalet"
  "${SITE_URL}/es/servicios/instalacion-red-badalona"
  "${SITE_URL}/es/servicios/instalacion-red-terrassa"
  "${SITE_URL}/es/blog/cuanto-cuesta-instalar-red-oficina-barcelona"
  "${SITE_URL}/es/blog/como-instalar-cable-red-casa"
  "${SITE_URL}/es/blog/que-es-cableado-estructurado"
  "${SITE_URL}/en"
  "${SITE_URL}/ru"
)

# Build JSON for IndexNow
URL_LIST=""
for url in "${KEY_URLS[@]}"; do
  URL_LIST="${URL_LIST}\"${url}\","
done
URL_LIST="${URL_LIST%,}"  # remove trailing comma

echo ""
echo "📡 Submitting ${#KEY_URLS[@]} URLs to IndexNow (Bing)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"cablecore.es\",
    \"key\": \"${INDEXNOW_KEY}\",
    \"keyLocation\": \"https://cablecore.es/${INDEXNOW_KEY}.txt\",
    \"urlList\": [${URL_LIST}]
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
echo "  IndexNow response: ${HTTP_CODE}"

echo ""
echo "✅ Done! Search engines notified."
echo ""
echo "📋 Next steps:"
echo "  1. Go to Google Search Console → URL Inspection"
echo "  2. Submit important URLs with 'Request indexing'"
echo "  3. Wait 3-7 days for Google to re-crawl"
