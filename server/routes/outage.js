require("dotenv").config();
const express = require("express");
const router  = express.Router();

// ─────────────────────────────
// 📍 ALL PHILIPPINE LOCATIONS
// ─────────────────────────────
const ALL_LOCATIONS = {
  "Quezon City":    { lat: 14.676,   lng: 121.0437 },
  "Manila":         { lat: 14.5995,  lng: 120.9842 },
  "Makati":         { lat: 14.5547,  lng: 121.0244 },
  "Pasig":          { lat: 14.5764,  lng: 121.0851 },
  "Taguig":         { lat: 14.5176,  lng: 121.0509 },
  "Cavite":         { lat: 14.4791,  lng: 120.8969 },
  "Laguna":         { lat: 14.235,   lng: 121.068  },
  "Cebu":           { lat: 10.3157,  lng: 123.8854 },
  "Davao":          { lat:  7.1907,  lng: 125.4553 },
  "Baguio":         { lat: 16.4023,  lng: 120.596  },
  "Batangas":       { lat: 13.7565,  lng: 121.0583 },
  "Bulacan":        { lat: 14.7942,  lng: 120.8799 },
  "Zamboanga":      { lat:  6.9214,  lng: 122.079  },
  "Cagayan de Oro": { lat:  8.4542,  lng: 124.6319 },
  "Iloilo":         { lat: 10.7202,  lng: 122.5621 },
  "Capiz":          { lat: 11.55,    lng: 122.75   },
  "Pampanga":       { lat: 15.0794,  lng: 120.62   },
  "Rizal":          { lat: 14.6042,  lng: 121.3085 },
  "Antipolo":       { lat: 14.5865,  lng: 121.1762 },
  "Valenzuela":     { lat: 14.7011,  lng: 120.983  },
  "Marikina":       { lat: 14.6507,  lng: 121.1029 },
  "Muntinlupa":     { lat: 14.4081,  lng: 121.0415 },
  "Paranaque":      { lat: 14.4793,  lng: 121.0198 },
  "Las Pinas":      { lat: 14.4453,  lng: 120.9833 },
  "Caloocan":       { lat: 14.65,    lng: 120.9667 },
  "Malabon":        { lat: 14.6625,  lng: 120.9578 },
  "Navotas":        { lat: 14.6667,  lng: 120.9417 },
  "Mandaluyong":    { lat: 14.5794,  lng: 121.0359 },
  "San Juan":       { lat: 14.6,     lng: 121.0333 },
  "Pateros":        { lat: 14.5458,  lng: 121.068  },
};

// ─────────────────────────────
// 🎲 SEEDED RANDOM
// Seed changes every hour so the map rotates realistically
// ─────────────────────────────
function seededRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildMockOutages() {
  const areas    = Object.keys(ALL_LOCATIONS);
  const hourSeed = Math.floor(Date.now() / (60 * 60 * 1000)); // new seed every hour

  // Score each area
  const scored = areas.map((area, i) => ({
    area,
    score: seededRand(hourSeed * 31 + i * 7),
  }));

  // Sort by score so we can deterministically pick the top ~50
  scored.sort((a, b) => b.score - a.score);

  // Top 10  → Outage   (red,    5–10 hits)
  // Next 20 → Investigating (yellow, 1–4 hits)
  // Rest    → Normal   (green,  0 hits)
  const hitCounts = {};
  scored.forEach(({ area, score }, idx) => {
    if (idx < 10) {
      hitCounts[area] = Math.floor(score * 6) + 5;   // 5–10
    } else if (idx < 30) {
      hitCounts[area] = Math.floor(score * 4) + 1;   // 1–4
    } else {
      hitCounts[area] = 0;
    }
  });

  // Build response
  return areas.map((area, i) => {
    const { lat, lng } = ALL_LOCATIONS[area];
    const hits = hitCounts[area] || 0;

    let status        = "Normal";
    let affectedUsers = 0;

    if (hits >= 5) {
      status        = "Outage";
      affectedUsers = hits * 20;
    } else if (hits >= 1) {
      status        = "Investigating";
      affectedUsers = hits * 20;
    }

    return { id: i + 1, area, lat, lng, status, affectedUsers };
  });
}

// ─────────────────────────────
// 🌐 API ENDPOINT
// ─────────────────────────────
router.get("/", (req, res) => {
  res.json(buildMockOutages());
});

module.exports = router;