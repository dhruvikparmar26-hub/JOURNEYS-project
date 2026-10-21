/**
 * JOURNEYS — Comprehensive Automated System Test Suite
 * 
 * Verifies end-to-end platform health across:
 * 1. Environment & Configuration Integrity
 * 2. Database Connectivity & Mongoose Models
 * 3. Core Business Services (Routing, Distance, Cost Estimations)
 * 4. Authentication, JWT Security & Token Lifecycle
 * 5. Live API Gateway Endpoints (if backend is active)
 * 
 * Run from project root: npm run test:system
 * Or from backend: node tests/system-test.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

// Load environment from backend/.env explicitly
dotenv.config({ path: path.join(backendRoot, '.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'development-jwt-access-secret-32-characters-minimum';
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/journeys';
}

import mongoose from 'mongoose';
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';


// Terminal color formatting
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

let totalPassed = 0;
let totalFailed = 0;
let totalSkipped = 0;
const report = [];

function pass(category, name, detail = '') {
  totalPassed++;
  console.log(`  ${c.green}✔ PASS${c.reset} [${category}] ${name} ${detail ? c.dim + '(' + detail + ')' + c.reset : ''}`);
  report.push({ category, name, status: 'PASS', detail });
}

function fail(category, name, error) {
  totalFailed++;
  console.log(`  ${c.red}✖ FAIL${c.reset} [${category}] ${name} ${c.red}→ ${error}${c.reset}`);
  report.push({ category, name, status: 'FAIL', error: String(error) });
}

function warn(category, name, warning) {
  totalSkipped++;
  console.log(`  ${c.yellow}▲ WARN${c.reset} [${category}] ${name} ${c.yellow}→ ${warning}${c.reset}`);
  report.push({ category, name, status: 'WARN', warning: String(warning) });
}

function header(title) {
  console.log(`\n${c.cyan}┌──────────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.cyan}│${c.reset}  ${c.bold}${title.padEnd(58)}${c.reset}${c.cyan}│${c.reset}`);
  console.log(`${c.cyan}└──────────────────────────────────────────────────────────────┘${c.reset}`);
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 1: Environment & File Structure Integrity
// ─────────────────────────────────────────────────────────────────────────
async function testEnvironment() {
  header('1. ENVIRONMENT & CONFIGURATION AUDIT');

  // Check backend .env
  const backendEnvPath = path.join(backendRoot, '.env');
  if (fs.existsSync(backendEnvPath)) {
    const envContent = fs.readFileSync(backendEnvPath, 'utf-8');
    pass('ENV', 'Backend .env exists');

    const hasMongo = envContent.includes('MONGODB_URI=');
    const hasJwt = envContent.includes('JWT_SECRET=');
    const hasPort = envContent.includes('PORT=');

    hasMongo ? pass('ENV', 'MONGODB_URI configured') : fail('ENV', 'MONGODB_URI missing in .env');
    hasJwt ? pass('ENV', 'JWT_SECRET configured') : fail('ENV', 'JWT_SECRET missing in .env');
    hasPort ? pass('ENV', 'PORT configured') : warn('ENV', 'PORT not explicitly defined, defaulting to 5050');
  } else {
    fail('ENV', 'Backend .env file not found', 'Please copy backend/.env.example to backend/.env');
  }

  // Check required project directories
  const requiredDirs = [
    'backend/models',
    'backend/routes',
    'backend/services',
    'backend/agents',
    'frontend/src/pages',
    'frontend/src/components',
  ];

  for (const d of requiredDirs) {
    const fullPath = path.join(projectRoot, d);
    if (fs.existsSync(fullPath)) {
      pass('FILES', `Directory ${d} verified`);
    } else {
      fail('FILES', `Missing directory ${d}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 2: Database Connectivity & Models Check
// ─────────────────────────────────────────────────────────────────────────
async function testDatabase() {
  header('2. DATABASE & MONGOOSE SCHEMAS VERIFICATION');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/journeys';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    pass('DB', 'MongoDB Connection Established', mongoUri);

    // Dynamic import models to ensure schemas compile without errors
    try {
      const { default: User } = await import('../models/User.js');
      const { default: Itinerary } = await import('../models/Itinerary.js');
      const { default: Booking } = await import('../models/Booking.js');
      const { default: PriceAlert } = await import('../models/PriceAlert.js');
      const { default: Wishlist } = await import('../models/Wishlist.js');
      const { default: Destination } = await import('../models/Destination.js');
      const { default: RouteCache } = await import('../models/RouteCache.js');

      User ? pass('MODELS', 'User schema loaded successfully') : fail('MODELS', 'User schema is undefined');
      Itinerary ? pass('MODELS', 'Itinerary schema loaded successfully') : fail('MODELS', 'Itinerary schema is undefined');
      Booking ? pass('MODELS', 'Booking schema loaded successfully') : fail('MODELS', 'Booking schema is undefined');
      PriceAlert ? pass('MODELS', 'PriceAlert schema loaded successfully') : fail('MODELS', 'PriceAlert schema is undefined');
      Wishlist ? pass('MODELS', 'Wishlist schema loaded successfully') : fail('MODELS', 'Wishlist schema is undefined');
      Destination ? pass('MODELS', 'Destination schema loaded successfully') : fail('MODELS', 'Destination schema is undefined');
      RouteCache ? pass('MODELS', 'RouteCache schema loaded successfully') : fail('MODELS', 'RouteCache schema is undefined');
    } catch (e) {
      fail('MODELS', 'Error importing Mongoose models', e.message);
    }
  } catch (err) {
    warn('DB', 'Local MongoDB instance not reachable', err.message);
    console.log(`     ${c.dim}Tip: Start MongoDB locally or supply a cloud MONGODB_URI in backend/.env${c.reset}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 3: Routing Engine & Cost Calculator Unit Verification
// ─────────────────────────────────────────────────────────────────────────
async function testRoutingEngine() {
  header('3. ROUTING & COST CALCULATION ENGINE');

  try {
    const { findMajorRoute, estimateCosts } = await import('../services/routing.js');

    // Test major corridor cache
    const delhiMumbai = findMajorRoute('Delhi', 'Mumbai');
    if (delhiMumbai && delhiMumbai.distanceKm === 1415) {
      pass('ROUTING', 'Major corridor lookup: Delhi → Mumbai (1415 km)', delhiMumbai.source);
    } else {
      fail('ROUTING', 'Major corridor lookup failed for Delhi → Mumbai', JSON.stringify(delhiMumbai));
    }

    // Test cost calculator
    const costs500km = estimateCosts(500);
    if (costs500km && costs500km.cab && costs500km.train && costs500km.bus) {
      pass('ROUTING', 'Cost estimation engine computed transport tiers', 
        `Cab: ₹${costs500km.cab.estimated}, Train: ₹${costs500km.train.sleeper?.estimated}, Bus AC: ₹${costs500km.bus.AC?.estimated}`);
    } else {
      fail('ROUTING', 'Cost estimation returned invalid transport object', JSON.stringify(costs500km));
    }

    // Test flight threshold logic (flights disabled under 250km)
    const shortTripCosts = estimateCosts(150);
    if (shortTripCosts && shortTripCosts.flight && shortTripCosts.flight.estimated === null) {
      pass('ROUTING', 'Short-distance flight exclusion policy verified (null for 150km)', shortTripCosts.flight.note);
    } else {
      fail('ROUTING', 'Flight was unexpectedly included for short trip <250km', JSON.stringify(shortTripCosts?.flight));
    }
  } catch (e) {
    fail('ROUTING', 'Exception in routing service test', e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 4: Security, Tokens & Auth Middleware Verification
// ─────────────────────────────────────────────────────────────────────────
async function testSecurityTokens() {
  header('4. AUTHENTICATION & SECURITY TOKEN LIFECYCLE');

  try {
    const { generateAccessToken, verifyAccessToken, generateRefreshToken } = await import('../utils/tokens.js');

    const testUserId = 'test_user_unique_123';
    const accessToken = generateAccessToken(testUserId);

    if (accessToken && typeof accessToken === 'string') {
      pass('AUTH', 'Access Token generated via JWT');
      
      const decoded = verifyAccessToken(accessToken);
      if (decoded && decoded.userId === testUserId) {
        pass('AUTH', 'Access Token successfully validated and decoded', `Type: ${decoded.type}`);
      } else {
        fail('AUTH', 'Token verification failed or returned mismatched payload');
      }
    } else {
      fail('AUTH', 'generateAccessToken failed to produce a valid token');
    }

    const refreshToken = generateRefreshToken();
    if (refreshToken && typeof refreshToken === 'string' && refreshToken.length === 64) {
      pass('AUTH', 'Secure Cryptographic 64-char Refresh Token generated');
    } else {
      fail('AUTH', 'generateRefreshToken failed to produce 64-char hex string');
    }
  } catch (e) {
    fail('AUTH', 'Exception in token utility test', e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 5: Live API Server Endpoints (HTTP Integration)
// ─────────────────────────────────────────────────────────────────────────
async function testLiveApiEndpoints() {
  header('5. BACKEND REST API ENDPOINT HEALTH CHECK');

  const BASE = 'http://localhost:5050';
  let serverLive = false;

  try {
    const healthRes = await axios.get(`${BASE}/api/health`, { timeout: 2000 });
    if (healthRes.data && healthRes.data.status === 'ok') {
      pass('API', 'GET /api/health → 200 OK', `Status: ${healthRes.data.status}`);
      serverLive = true;
    }
  } catch (e) {
    warn('API', `Live server at ${BASE} is not running`, 'Start server with "npm run dev" to test live HTTP endpoints');
  }

  if (serverLive) {
    const jar = new CookieJar();
    const api = wrapper(axios.create({ jar }));

    // Test Config
    try {
      const cfg = await api.get(`${BASE}/api/config`);
      cfg.status === 200 ? pass('API', 'GET /api/config → 200 OK') : fail('API', 'GET /api/config', cfg.status);
    } catch (e) { fail('API', 'GET /api/config', e.message); }

    // Test Protected Route Block (Auth Gate)
    try {
      await axios.get(`${BASE}/api/notifications`);
      fail('SECURITY', 'GET /api/notifications allowed unauthenticated request');
    } catch (e) {
      e.response?.status === 401 
        ? pass('SECURITY', 'GET /api/notifications correctly blocked with 401 Unauthorized')
        : fail('SECURITY', 'Expected 401 on protected endpoint', e.response?.status);
    }

    // Test Route Endpoint
    try {
      const routeRes = await api.get(`${BASE}/api/route`, {
        params: {
          origin: JSON.stringify({ lat: 28.6139, lng: 77.209, label: 'Delhi' }),
          destination: JSON.stringify({ lat: 26.9124, lng: 75.7873, label: 'Jaipur' }),
          mode: 'all',
        },
      });
      routeRes.data?.route?.distanceKm 
        ? pass('API', `GET /api/route (Delhi → Jaipur) returned ${routeRes.data.route.distanceKm} km`)
        : fail('API', 'GET /api/route returned empty route data');
    } catch (e) { fail('API', 'GET /api/route', e.message); }

    // Test Guest Itinerary Creation
    let itineraryId = null;
    try {
      const itinRes = await api.post(`${BASE}/api/itineraries`, {
        origin: { lat: 28.6139, lng: 77.209, label: 'Delhi' },
        destination: { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        budgetMin: 5000,
        budgetMax: 20000,
      });
      itineraryId = itinRes.data?.itineraryId;
      itinRes.status === 202 && itineraryId 
        ? pass('API', `POST /api/itineraries (Guest Delhi → Jaipur) → 202 Accepted`, `ID: ${itineraryId}`)
        : fail('API', 'POST /api/itineraries status', itinRes.status);
    } catch (e) { fail('API', 'POST /api/itineraries', e.message); }

    // Test Guest Isolation
    if (itineraryId) {
      try {
        await axios.get(`${BASE}/api/itineraries/${itineraryId}`);
        fail('SECURITY', 'Guest itinerary accessed without session cookie (should be 403)');
      } catch (e) {
        e.response?.status === 403
          ? pass('SECURITY', 'Cross-session isolation verified (Blocked with 403 Forbidden)')
          : fail('SECURITY', 'Access control status unexpected', e.response?.status);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// RUNNER & SUMMARY
// ─────────────────────────────────────────────────────────────────────────
async function runAll() {
  console.log(`\n${c.magenta}================================================================${c.reset}`);
  console.log(`${c.bold}${c.magenta}       JOURNEYS — COMPREHENSIVE AUTOMATED TEST RUNNER           ${c.reset}`);
  console.log(`${c.magenta}================================================================${c.reset}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  await testEnvironment();
  await testDatabase();
  await testRoutingEngine();
  await testSecurityTokens();
  await testLiveApiEndpoints();

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  // Final Summary Banner
  console.log(`\n${c.cyan}================================================================${c.reset}`);
  console.log(`${c.bold}                    FINAL TEST SUITE SUMMARY                    ${c.reset}`);
  console.log(`${c.cyan}================================================================${c.reset}`);
  console.log(`  ${c.green}✔ PASSED : ${totalPassed}${c.reset}`);
  console.log(`  ${c.red}✖ FAILED : ${totalFailed}${c.reset}`);
  console.log(`  ${c.yellow}▲ WARN   : ${totalSkipped}${c.reset}`);
  console.log(`  ${c.bold}TOTAL   : ${totalPassed + totalFailed + totalSkipped}${c.reset}`);
  console.log(`${c.cyan}================================================================${c.reset}\n`);

  if (totalFailed === 0) {
    console.log(`${c.green}${c.bold}🎉 ALL EXECUTED SYSTEM CHECKS PASSED!${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${c.red}${c.bold}⚠️  ${totalFailed} CHECK(S) FAILED. Please review the error log above.${c.reset}\n`);
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
