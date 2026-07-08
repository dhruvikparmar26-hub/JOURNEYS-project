import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import RouteCache from '../models/RouteCache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Load static data files ─────────────────────────────────────

const trainFares = JSON.parse(
  readFileSync(join(__dirname, '..', 'config', 'train-fares.json'), 'utf-8')
);

const majorRoutes = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'major-routes.json'), 'utf-8')
);

// ─── Configurable fare constants ─────────────────────────────────

const CAB_BASE_FARE = Number(process.env.CAB_BASE_FARE) || 50;
const CAB_PER_KM = Number(process.env.CAB_PER_KM_FARE) || 14;
const BUS_NON_AC_PER_KM = Number(process.env.BUS_NON_AC_PER_KM) || 1.5;
const BUS_AC_PER_KM = Number(process.env.BUS_AC_PER_KM) || 2.5;
const FLIGHT_BASE_FARE = Number(process.env.FLIGHT_BASE_FARE) || 2500;
const FLIGHT_PER_KM = Number(process.env.FLIGHT_PER_KM) || 4.5;
const FLIGHT_MIN_DISTANCE_KM = 300;

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Round a coordinate to 3 decimal places (~110m accuracy).
 */
const round3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Normalize a city label for matching against major-routes.json.
 * Strips common suffixes like ", India", extracts the first word before a comma,
 * and lowercases everything.
 */
const normalizeCity = (label) => {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/,\s*india$/i, '')
    .split(',')[0]
    .trim()
    .replace(/\s+/g, ' ');
};

// ─── Major corridor lookup ───────────────────────────────────────

/**
 * Check if the origin/destination pair matches a pre-verified corridor.
 * Returns { distanceKm } or null.
 */
export const findMajorRoute = (originLabel, destLabel) => {
  const o = normalizeCity(originLabel);
  const d = normalizeCity(destLabel);

  const match = majorRoutes.find(
    (r) => normalizeCity(r.origin) === o && normalizeCity(r.destination) === d
  );

  return match ? { distanceKm: match.distanceKm, source: 'major-routes-cache' } : null;
};

// ─── Google Routes API matrix call ───────────────────────────────

/**
 * getRouteMatrix(origin, destination)
 *
 * Calls Google Routes API computeRouteMatrix for DRIVE mode.
 * Caches the result in MongoDB keyed by rounded coordinates for 24h.
 *
 * @param {{ lat: number, lng: number, label: string }} origin
 * @param {{ lat: number, lng: number, label: string }} destination
 * @returns {{ distanceMeters: number, durationSeconds: number, distanceKm: number, source: string }}
 */
export const getRouteMatrix = async (origin, destination) => {
  const oLat = round3(origin.lat);
  const oLng = round3(origin.lng);
  const dLat = round3(destination.lat);
  const dLng = round3(destination.lng);

  // 1. Check MongoDB cache first
  const cached = await RouteCache.findOne({
    originLatRounded: oLat,
    originLngRounded: oLng,
    destLatRounded: dLat,
    destLngRounded: dLng,
  });

  if (cached) {
    return {
      distanceMeters: cached.distanceMeters,
      durationSeconds: cached.durationSeconds,
      distanceKm: Math.round(cached.distanceMeters / 1000),
      source: 'mongodb-cache',
    };
  }

  // 2. Call Google Routes API
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.startsWith('AIzaSyDummy')) {
    // No valid API key — estimate using Haversine straight-line distance × 1.35
    const straightLineKm = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const estimatedKm = Math.round(straightLineKm * 1.35); // road factor
    const estimatedMeters = estimatedKm * 1000;
    const estimatedDuration = Math.round((estimatedKm / 60) * 3600); // ~60 km/h avg

    // Cache the estimate
    await RouteCache.create({
      originLatRounded: oLat,
      originLngRounded: oLng,
      destLatRounded: dLat,
      destLngRounded: dLng,
      distanceMeters: estimatedMeters,
      durationSeconds: estimatedDuration,
    });

    return {
      distanceMeters: estimatedMeters,
      durationSeconds: estimatedDuration,
      distanceKm: estimatedKm,
      source: 'haversine-estimate',
    };
  }

  try {
    const response = await axios.post(
      'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      {
        origins: [
          {
            waypoint: {
              location: {
                latLng: { latitude: origin.lat, longitude: origin.lng },
              },
            },
          },
        ],
        destinations: [
          {
            waypoint: {
              location: {
                latLng: { latitude: destination.lat, longitude: destination.lng },
              },
            },
          },
        ],
        travelMode: 'DRIVE',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,duration',
        },
        timeout: 10000,
      }
    );

    const element = response.data?.[0];
    if (!element || element.distanceMeters == null) {
      throw new Error('Routes API returned no results for this pair');
    }

    const distanceMeters = element.distanceMeters;
    const durationStr = element.duration || '0s';
    const durationSeconds = parseInt(durationStr.replace('s', ''), 10) || 0;

    // 3. Cache the result
    await RouteCache.create({
      originLatRounded: oLat,
      originLngRounded: oLng,
      destLatRounded: dLat,
      destLngRounded: dLng,
      distanceMeters,
      durationSeconds,
    });

    return {
      distanceMeters,
      durationSeconds,
      distanceKm: Math.round(distanceMeters / 1000),
      source: 'google-routes-api',
    };
  } catch (error) {
    console.error('Google Routes API error:', error.message);
    // Fallback to Haversine estimate on API failure
    const straightLineKm = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const estimatedKm = Math.round(straightLineKm * 1.35);

    return {
      distanceMeters: estimatedKm * 1000,
      durationSeconds: Math.round((estimatedKm / 60) * 3600),
      distanceKm: estimatedKm,
      source: 'haversine-fallback',
    };
  }
};

// ─── Cost estimation engine ──────────────────────────────────────

/**
 * estimateCosts(distanceKm, mode)
 *
 * Pure function — no external API calls.
 * Returns cost breakdowns in INR for the requested transport mode(s).
 *
 * @param {number} distanceKm
 * @param {string} mode — 'cab' | 'bus' | 'train' | 'flight' | 'all'
 * @returns {object} Cost estimates per mode
 */
export const estimateCosts = (distanceKm, mode = 'all') => {
  const costs = {};

  // Cab
  if (mode === 'all' || mode === 'cab') {
    costs.cab = {
      estimated: Math.round(CAB_BASE_FARE + CAB_PER_KM * distanceKm),
      breakdown: `Base ₹${CAB_BASE_FARE} + ₹${CAB_PER_KM}/km × ${distanceKm}km`,
      currency: 'INR',
    };
  }

  // Bus
  if (mode === 'all' || mode === 'bus') {
    costs.bus = {
      nonAC: {
        estimated: Math.round(BUS_NON_AC_PER_KM * distanceKm),
        breakdown: `₹${BUS_NON_AC_PER_KM}/km × ${distanceKm}km`,
      },
      AC: {
        estimated: Math.round(BUS_AC_PER_KM * distanceKm),
        breakdown: `₹${BUS_AC_PER_KM}/km × ${distanceKm}km`,
      },
      currency: 'INR',
    };
  }

  // Train
  if (mode === 'all' || mode === 'train') {
    const band = trainFares.bands.find(
      (b) => distanceKm >= b.min && distanceKm <= b.max
    );

    if (band) {
      costs.train = {
        sleeper: { estimated: band.sleeper, class: 'Sleeper' },
        ac3: { estimated: band.ac3, class: '3AC' },
        ac2: { estimated: band.ac2, class: '2AC' },
        note: `Based on ${distanceKm}km distance band (${band.min}–${band.max}km)`,
        currency: 'INR',
      };
    } else {
      costs.train = { note: 'No fare band found for this distance', currency: 'INR' };
    }
  }

  // Flight
  if (mode === 'all' || mode === 'flight') {
    if (distanceKm > FLIGHT_MIN_DISTANCE_KM) {
      costs.flight = {
        estimated: Math.round(FLIGHT_BASE_FARE + FLIGHT_PER_KM * distanceKm),
        breakdown: `Base ₹${FLIGHT_BASE_FARE} + ₹${FLIGHT_PER_KM}/km × ${distanceKm}km`,
        disclaimer: 'Estimated, not live pricing — no production flight API key configured',
        currency: 'INR',
      };
    } else {
      costs.flight = {
        estimated: null,
        note: `Flights only estimated for distances > ${FLIGHT_MIN_DISTANCE_KM}km (this route is ${distanceKm}km)`,
        currency: 'INR',
      };
    }
  }

  return costs;
};

export const getRouteEstimate = async ({ origin, destination, mode = 'all' }) => {
  const majorRoute = findMajorRoute(origin.label, destination.label);
  let distanceKm;
  let durationSeconds;
  let source;

  if (majorRoute) {
    distanceKm = majorRoute.distanceKm;
    durationSeconds = Math.round((distanceKm / 60) * 3600);
    source = majorRoute.source;
  } else {
    const routeResult = await getRouteMatrix(origin, destination);
    distanceKm = routeResult.distanceKm;
    durationSeconds = routeResult.durationSeconds;
    source = routeResult.source;
  }

  const rawCosts = estimateCosts(distanceKm, mode);
  const normalizedCosts = {};

  if (rawCosts.cab) normalizedCosts.cab = rawCosts.cab.estimated;
  if (rawCosts.bus) {
    normalizedCosts.bus = rawCosts.bus.AC?.estimated ?? rawCosts.bus.nonAC?.estimated;
  }
  if (rawCosts.train) {
    normalizedCosts.train = rawCosts.train.sleeper?.estimated;
  }
  if (rawCosts.flight) normalizedCosts.flight = rawCosts.flight.estimated;

  return {
    distanceKm,
    durationSeconds,
    source,
    costs: normalizedCosts,
    rawCosts,
  };
};

// ─── Haversine formula ───────────────────────────────────────────

/**
 * Returns straight-line distance between two lat/lng pairs in km.
 */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
