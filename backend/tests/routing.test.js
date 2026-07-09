/**
 * Routing & Cost Engine — Test Suite
 *
 * Run: node tests/routing.test.js
 *
 * Tests the routing service in isolation by importing functions directly.
 * Requires MongoDB to be running for cache tests.
 */

import '../config/loadEnv.js';
import mongoose from 'mongoose';
import { findMajorRoute, getRouteMatrix, estimateCosts } from '../services/routing.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/journeys';

let passed = 0;
let failed = 0;

const assert = (condition, label) => {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
};

const runTests = async () => {
  console.log('\n🧪 JOURNEYS Routing & Cost Engine — Test Suite\n');
  console.log('───────────────────────────────────────────────\n');

  // Connect to MongoDB
  await mongoose.connect(MONGO_URI);
  console.log('📦 Connected to MongoDB\n');

  // ─── Test 1: Major corridor lookup (Delhi → Mumbai) ──────────
  console.log('Test 1: Major corridor lookup (Delhi → Mumbai)');
  {
    const result = findMajorRoute('Delhi', 'Mumbai');
    assert(result !== null, 'Delhi-Mumbai found in major-routes.json');
    assert(result?.distanceKm === 1415, `Distance is 1415km (got ${result?.distanceKm})`);
    assert(result?.source === 'major-routes-cache', `Source is major-routes-cache (got ${result?.source})`);
  }
  console.log('');

  // ─── Test 2: Major corridor with casing/suffix variation ─────
  console.log('Test 2: Major corridor with casing (jaipur → DELHI)');
  {
    const result = findMajorRoute('jaipur', 'DELHI');
    assert(result !== null, 'Case-insensitive match works');
    assert(result?.distanceKm === 270, `Distance is 270km (got ${result?.distanceKm})`);
  }
  console.log('');

  // ─── Test 3: Small-town pair (live API / Haversine fallback) ─
  console.log('Test 3: Small-town pair (Rishikesh → Dehradun coordinates)');
  {
    const origin = { lat: 30.0869, lng: 78.2676, label: 'Rishikesh' };
    const dest = { lat: 30.3165, lng: 78.0322, label: 'Dehradun' };

    const result = await getRouteMatrix(origin, dest);
    assert(result.distanceKm > 0, `Distance is positive (got ${result.distanceKm}km)`);
    assert(result.durationSeconds > 0, `Duration is positive (got ${result.durationSeconds}s)`);
    assert(
      ['google-routes-api', 'mongodb-cache', 'haversine-estimate', 'haversine-fallback', 'osm-osrm-api'].includes(result.source),
      `Source is valid (got ${result.source})`
    );
  }
  console.log('');

  // ─── Test 4: Cost estimation — all modes ─────────────────────
  console.log('Test 4: Cost estimation for 500km distance');
  {
    const costs = estimateCosts(500, 'all');

    // Cab: 50 + 14*500 = 7050
    assert(costs.cab?.estimated === 7050, `Cab estimate = ₹7,050 (got ₹${costs.cab?.estimated})`);

    // Bus non-AC: 1.5 * 500 = 750
    assert(costs.bus?.nonAC?.estimated === 750, `Bus non-AC = ₹750 (got ₹${costs.bus?.nonAC?.estimated})`);

    // Bus AC: 2.5 * 500 = 1250
    assert(costs.bus?.AC?.estimated === 1250, `Bus AC = ₹1,250 (got ₹${costs.bus?.AC?.estimated})`);

    // Train: 500km falls in band 201-500km → sleeper 250, ac3 650, ac2 900
    assert(costs.train?.sleeper?.estimated === 250, `Train Sleeper = ₹250 (got ₹${costs.train?.sleeper?.estimated})`);
    assert(costs.train?.ac3?.estimated === 650, `Train 3AC = ₹650 (got ₹${costs.train?.ac3?.estimated})`);

    // Flight: 2500 + 4.5*500 = 4750
    assert(costs.flight?.estimated === 4750, `Flight estimate = ₹4,750 (got ₹${costs.flight?.estimated})`);
    assert(costs.flight?.disclaimer != null, 'Flight has a disclaimer');
  }
  console.log('');

  // ─── Test 5: Flight excluded under 300km ─────────────────────
  console.log('Test 5: Flight excluded for short distance (150km)');
  {
    const costs = estimateCosts(150, 'flight');
    assert(costs.flight?.estimated === null, `Flight estimate is null (got ${costs.flight?.estimated})`);
    assert(costs.flight?.note != null, 'Flight note explains minimum distance');
  }
  console.log('');

  // ─── Summary ─────────────────────────────────────────────────
  console.log('───────────────────────────────────────────────');
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runTests().catch((err) => {
  console.error('❌ Test suite crashed:', err);
  process.exit(1);
});
