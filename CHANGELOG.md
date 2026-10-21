# Changelog

All notable changes to the **JOURNEYS** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-21

### Added
- **Real-Time Global Itinerary Discovery Engine (`backend/agents/orchestrator.js`):**
  - Wikipedia GeoSearch API integration (`list=geosearch`) for dynamic extraction of verified landmarks, museums, and shrines within a 15 km destination radius.
  - OpenStreetMap Overpass query integration for authentic local cultural and recreational spots.
  - Live Nominatim hotel discovery with budget-tiered nightly rates and verified coordinates.
  - Airport corridor resolution with authentic IATA codes (`HND`, `NAP`, `CDG`, `DEL`, `JFK`, etc.) for long-haul routes (>300 km).
  - Chronological non-overlapping schedule time slots: 09:30 (Heritage), 13:00 (Dining), 15:30 (Culture), 18:30 (Promenade).
  - Explicit `lat` and `lng` coordinate mapping in Mongoose `activities` schema and route payloads.
- **Frontend Modularization (`frontend/src/`):**
  - Decoupled monolithic `App.jsx` into standalone views: `LandingPage.jsx`, `DashboardPage.jsx`, `LoginPage.jsx`, and `SignupPage.jsx`.
  - Created standalone `AutocompleteInput.jsx` with keyboard arrow navigation and blur dismissal.
  - Isolated geocoding and Haversine distance functions into `src/utils/geo.js`.
  - Extracted 100+ static destination city definitions into `src/data/locations.js`.
- **Quality Assurance & Verification Testing:**
  - Automated routing and multi-modal cost test suite (`tests/routing.test.js`) with 17 passed checks.
  - Rate-limit test bypass (`shouldSkipRateLimit`) for non-blocking test automation.
  - System-level end-to-end evaluation harness (`backend/tests/system-test.js` & `eval-itineraries.js`).

### Changed
- **CI/CD Pipeline (`.github/workflows/daily-commit.yml`):**
  - Replaced commit-based `.zip` archive storage with `actions/upload-artifact@v4` using a 14-day retention policy.
- **Error Handling & State Recovery:**
  - Transitioned itinerary failure states from silent hanging/draft to explicit `'failed'` status with persistent audit logs.

### Fixed
- **MongoDB Route Buffering (`backend/services/routing.js`):**
  - Added `mongoose.connection?.readyState === 1` guards to prevent queries from hanging indefinitely when MongoDB is disconnected.
- **Static Analysis Compliance:**
  - Enforced strict React Hook dependencies in `.oxlintrc.json`, achieving 0 errors across all 71 frontend files.

### Removed
- Orphaned duplicate page `frontend/src/pages/MyTripsPage.jsx` (consolidated into canonical `MyTrips.jsx`).
- Deprecated CommonJS script `backend/SERVER_WIRING.js`.

---

## [1.0.0] - 2026-10-18

### Added
- Initial full-stack repository structure with Express/LangGraph backend and React 19/Vite frontend.
- Authentication, session management, and rate limiting middleware.
- MapView Leaflet integration and initial trip request schemas.
