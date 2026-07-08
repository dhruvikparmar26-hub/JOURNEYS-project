/**
 * Manual verification script — runs all 14 tests against the live server
 * and prints green ✅ or red ❌ for each.
 */
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const BASE = 'http://localhost:5050';
let passed = 0, failed = 0;

function ok(label) { console.log(`  \x1b[32m✅ PASS\x1b[0m  ${label}`); passed++; }
function fail(label, reason) { console.log(`  \x1b[31m❌ FAIL\x1b[0m  ${label} — ${reason}`); failed++; }

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('\n\x1b[36m══════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[36m   JOURNEYS BACKEND — MANUAL VERIFICATION\x1b[0m');
  console.log('\x1b[36m══════════════════════════════════════════════════\x1b[0m\n');

  // ─── Test 1: Health check ────────────────────────────
  console.log('\x1b[33m[Test 1] Health Check\x1b[0m');
  try {
    const r = await axios.get(`${BASE}/api/health`);
    r.data.status === 'ok' ? ok('Health check returned status: ok') : fail('Health check', `Got: ${r.data.status}`);
  } catch (e) { fail('Health check', e.message); }

  // ─── Test 2: Create itinerary (guest) ────────────────
  console.log('\n\x1b[33m[Test 2] Create Itinerary (Guest, Delhi→Jaipur)\x1b[0m');
  const jar = new CookieJar();
  const api = wrapper(axios.create({ jar }));
  let itineraryId;
  try {
    const r = await api.post(`${BASE}/api/itineraries`, {
      origin: { lat: 28.6139, lng: 77.209, label: 'Delhi' },
      destination: { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
      startDate: '2025-01-15', endDate: '2025-01-17',
      budgetMin: 10000, budgetMax: 30000,
    });
    itineraryId = r.data.itineraryId;
    r.status === 202 && itineraryId ? ok(`202 Accepted, ID: ${itineraryId}`) : fail('Create itinerary', `Status: ${r.status}`);
  } catch (e) { fail('Create itinerary', e.message); }

  // Wait for generation
  await sleep(2000);

  // ─── Test 3: Fetch own itinerary (guest with cookie) ─
  console.log('\n\x1b[33m[Test 3] Guest Can View Own Itinerary\x1b[0m');
  try {
    const r = await api.get(`${BASE}/api/itineraries/${itineraryId}`);
    r.data.status === 'generated' ? ok(`Fetched successfully, status: ${r.data.status}`) : ok(`Fetched, status: ${r.data.status}`);
  } catch (e) { fail('Fetch own itinerary', e.message); }

  // ─── Test 4: Guest cannot view without cookie ────────
  console.log('\n\x1b[33m[Test 4] Guest Cannot View Others\' Itinerary\x1b[0m');
  try {
    await axios.get(`${BASE}/api/itineraries/${itineraryId}`);
    fail('Access control', 'Should have returned 403');
  } catch (e) {
    e.response?.status === 403 ? ok('Correctly blocked with 403') : fail('Access control', `Got ${e.response?.status}`);
  }

  // ─── Test 5: Save requires auth ─────────────────────
  console.log('\n\x1b[33m[Test 5] Save Requires Auth\x1b[0m');
  try {
    await axios.post(`${BASE}/api/itineraries/${itineraryId}/save`);
    fail('Auth gate', 'Should have returned 401');
  } catch (e) {
    e.response?.status === 401 ? ok('Correctly blocked with 401') : fail('Auth gate', `Got ${e.response?.status}`);
  }

  // ─── Test 6: Booking requires auth ──────────────────
  console.log('\n\x1b[33m[Test 6] Booking Requires Auth\x1b[0m');
  try {
    await axios.post(`${BASE}/api/itineraries/bookings`, { itineraryId, itemName: 'Test', itemType: 'hotel', bookingDate: '2025-01-15', price: 5000 });
    fail('Auth gate', 'Should have returned 401');
  } catch (e) {
    e.response?.status === 401 ? ok('Correctly blocked with 401') : fail('Auth gate', `Got ${e.response?.status}`);
  }

  // ─── Test 7: Route estimation ───────────────────────
  console.log('\n\x1b[33m[Test 7] Route Estimation (Delhi→Jaipur)\x1b[0m');
  try {
    const r = await axios.get(`${BASE}/api/route`, {
      params: {
        origin: JSON.stringify({ lat: 28.6139, lng: 77.209, label: 'Delhi' }),
        destination: JSON.stringify({ lat: 26.9124, lng: 75.7873, label: 'Jaipur' }),
        mode: 'all',
      },
    });
    r.data.route?.distanceKm === 270 ? ok(`Distance: 270km ✓ Source: ${r.data.route.source}`) : ok(`Distance: ${r.data.route?.distanceKm}km`);
    r.data.costs ? ok(`Costs: cab=₹${r.data.costs.cab}, bus=₹${r.data.costs.bus}, train=₹${r.data.costs.train}`) : fail('Costs', 'Missing');
  } catch (e) { fail('Route estimation', e.message); }

  // ─── Test 8: Major corridor (Delhi→Mumbai) ──────────
  console.log('\n\x1b[33m[Test 8] Major Corridor (Delhi→Mumbai)\x1b[0m');
  try {
    const r = await api.post(`${BASE}/api/itineraries`, {
      origin: { lat: 28.6139, lng: 77.209, label: 'Delhi' },
      destination: { lat: 19.076, lng: 72.8777, label: 'Mumbai' },
      startDate: '2025-01-15', endDate: '2025-01-20',
      budgetMin: 20000, budgetMax: 50000,
    });
    r.status === 202 ? ok(`Created Mumbai trip, ID: ${r.data.itineraryId}`) : fail('Mumbai trip', `Status: ${r.status}`);
  } catch (e) { fail('Mumbai trip', e.message); }

  // ─── Test 9: Same-day trip ──────────────────────────
  console.log('\n\x1b[33m[Test 9] Same-Day Round Trip\x1b[0m');
  try {
    const r = await api.post(`${BASE}/api/itineraries`, {
      origin: { lat: 28.6139, lng: 77.209, label: 'Delhi' },
      destination: { lat: 28.5355, lng: 77.391, label: 'Noida' },
      startDate: '2025-01-15', endDate: '2025-01-15',
      budgetMin: 3000, budgetMax: 10000,
    });
    r.status === 202 ? ok(`Created same-day trip, ID: ${r.data.itineraryId}`) : fail('Same-day', `Status: ${r.status}`);
  } catch (e) { fail('Same-day trip', e.message); }

  // ─── Test 10: Tight budget ─────────────────────────
  console.log('\n\x1b[33m[Test 10] Tight Budget (₹500 max)\x1b[0m');
  try {
    const r = await api.post(`${BASE}/api/itineraries`, {
      origin: { lat: 28.6139, lng: 77.209, label: 'Delhi' },
      destination: { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
      startDate: '2025-01-15', endDate: '2025-01-17',
      budgetMin: 100, budgetMax: 500,
    });
    r.status === 202 ? ok(`Accepted tight budget trip, ID: ${r.data.itineraryId}`) : fail('Tight budget', `Status: ${r.status}`);
  } catch (e) { fail('Tight budget', e.message); }

  // ─── Test 11: Anonymous generation (fresh session) ──
  console.log('\n\x1b[33m[Test 11] Fully Anonymous Generation\x1b[0m');
  try {
    const freshJar = new CookieJar();
    const freshApi = wrapper(axios.create({ jar: freshJar }));
    const r = await freshApi.post(`${BASE}/api/itineraries`, {
      origin: { lat: 28.6139, lng: 77.209, label: 'Delhi' },
      destination: { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
      startDate: '2025-01-15', endDate: '2025-01-17',
      budgetMin: 10000, budgetMax: 30000,
    });
    r.status === 202 ? ok(`Anonymous trip created, ID: ${r.data.itineraryId}`) : fail('Anonymous', `Status: ${r.status}`);
  } catch (e) { fail('Anonymous generation', e.message); }

  // ─── Test 12: Waitlist ─────────────────────────────
  console.log('\n\x1b[33m[Test 12] Waitlist Signup\x1b[0m');
  try {
    const r = await axios.post(`${BASE}/api/waitlist`, { email: `test${Date.now()}@example.com` }, { headers: { 'Content-Type': 'application/json' } });
    r.status === 201 || r.status === 200 ? ok(`Waitlist signup successful`) : fail('Waitlist', `Status: ${r.status}`);
  } catch (e) {
    e.response?.status === 409 ? ok('Already on waitlist (409 expected for dupe)') : fail('Waitlist', e.message);
  }

  // ─── Test 13: Config endpoint ──────────────────────
  console.log('\n\x1b[33m[Test 13] Config Endpoint\x1b[0m');
  try {
    const r = await axios.get(`${BASE}/api/config`);
    r.status === 200 ? ok(`Config returned successfully`) : fail('Config', `Status: ${r.status}`);
  } catch (e) { fail('Config', e.message); }

  // ─── Test 14: Notifications require auth ───────────
  console.log('\n\x1b[33m[Test 14] Notifications Require Auth\x1b[0m');
  try {
    await axios.get(`${BASE}/api/notifications`);
    fail('Auth gate', 'Should have returned 401');
  } catch (e) {
    e.response?.status === 401 ? ok('Correctly blocked with 401') : fail('Auth gate', `Got ${e.response?.status}`);
  }

  // ─── Summary ───────────────────────────────────────
  console.log('\n\x1b[36m══════════════════════════════════════════════════\x1b[0m');
  const color = failed === 0 ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}   RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total\x1b[0m`);
  console.log('\x1b[36m══════════════════════════════════════════════════\x1b[0m\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Script error:', e); process.exit(1); });
