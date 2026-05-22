const adminUrl = (process.env.FSM_ADMIN_URL || 'https://frontend-one-tawny-63.vercel.app')
  .trim()
  .replace(/\/+$/, '');

async function fetchText(path) {
  const response = await fetch(`${adminUrl}${path}`);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path} failed with HTTP ${response.status}`);
  }
  return text;
}

async function main() {
  const html = await fetchText('/');
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('Admin app shell did not include the React root element');
  }

  const manifest = JSON.parse(await fetchText('/asset-manifest.json'));
  const jsPaths = Object.values(manifest.files || {})
    .filter((path) => typeof path === 'string' && path.startsWith('/static/js/') && path.endsWith('.js'));
  if (!jsPaths.length) {
    throw new Error('Admin asset manifest did not include JavaScript bundles');
  }

  const bundleText = (await Promise.all(jsPaths.map((path) => fetchText(path)))).join('\n');
  const requiredMarkers = [
    'Publish Button',
    'Test Mode',
    'RUN TEST',
    'Publish Test Running',
    'dryRun',
    'testMode',
    'https://vortex-forklift-api-production.up.railway.app',
  ];
  const missing = requiredMarkers.filter((marker) => !bundleText.includes(marker));
  if (missing.length) {
    throw new Error(`Admin bundle is missing expected Publish Button markers: ${missing.join(', ')}`);
  }

  const fallbackMarkers = [
    'manual_required',
    'Confirm EquipFinder vendor/contact path',
    'Confirm current MachineryATS domain/portal',
    'Confirm approved Forkliftaction member account',
    'Confirm channel manager approval',
  ];
  const missingFallback = fallbackMarkers.filter((marker) => !bundleText.includes(marker));
  if (missingFallback.length) {
    throw new Error(`Admin bundle is missing current Publish Button fallback markers: ${missingFallback.join(', ')}`);
  }

  console.log('Forklift Sales Machine admin deployment smoke check');
  console.log(`Admin URL: ${adminUrl}`);
  console.log(`App shell: OK`);
  console.log(`Bundles checked: ${jsPaths.length}`);
  console.log('Publish Button Test Mode bundle markers: OK');
  console.log('Publish Button fallback channel markers: OK');
}

main().catch((error) => {
  console.error(`Admin deployment smoke check failed: ${error.message}`);
  process.exit(1);
});
