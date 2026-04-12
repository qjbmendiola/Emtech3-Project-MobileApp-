require("dotenv").config();
const express = require("express");
const router  = express.Router();
const cheerio = require("cheerio");
const got     = require("got");

// ─────────────────────────────
// 📍 ALL PHILIPPINE LOCATIONS (always shown)
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
// ⚙️ SCRAPE SOURCES
// ─────────────────────────────
const OUTAGE_SOURCES = [
  { isp: "PLDT",     url: "https://outage.report/ph/pldt" },
  { isp: "Globe",    url: "https://outage.report/ph/globe" },
  { isp: "Converge", url: "https://outage.report/ph/converge-ict" },
];

// ─────────────────────────────
// 🔥 REPORT STORAGE
// ─────────────────────────────
let scrapedReports = [];

// ─────────────────────────────
// 📡 SCRAPER
// ─────────────────────────────
async function scrapeOutageReport() {
  const newReports = [];

  for (const src of OUTAGE_SOURCES) {
    try {
      const res = await got(src.url, {
        timeout: { request: 15000 },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        },
      });

      const $ = cheerio.load(res.body);

      $("p, li, div.tweet, .outage-text, .report-text").each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20 && text.length < 500) {
          newReports.push({ message: text, isp: src.isp, time: new Date() });
        }
      });

    } catch (err) {
      console.log(`[outage] scrape error (${src.isp}):`, err.message);
    }
  }

  return newReports;
}

// ─────────────────────────────
// 🔄 FETCH & CACHE
// ─────────────────────────────
async function fetchReports() {
  try {
    const scraped = await scrapeOutageReport();
    const seen = new Set();
    scrapedReports = scraped.filter((r) => {
      const key = r.message.slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`[outage] scraped reports: ${scrapedReports.length}`);
  } catch (err) {
    console.error("[outage] fetchReports error:", err.message);
  }
}

fetchReports();
setInterval(fetchReports, 5 * 60 * 1000);

// ─────────────────────────────
// 📍 LOCATION DETECTION FROM SCRAPED TEXT
// ─────────────────────────────
function getArea(msg) {
  if (!msg) return null;
  const lower = msg.toLowerCase();
  for (const area in ALL_LOCATIONS) {
    if (lower.includes(area.toLowerCase())) return area;
    if (lower.includes(area.toLowerCase().split(" ")[0])) return area;
  }
  return null;
}

// ─────────────────────────────
// 📊 BUILD OUTAGE LIST
// Always returns ALL locations.
// Status is driven by scrape hits — more hits = higher severity.
// Locations with no scrape hits default to "Normal".
// ─────────────────────────────
function buildOutages() {
  // Count scrape hits per area
  const hitCount = {};
  for (const r of scrapedReports) {
    const area = getArea(r.message);
    if (area) {
      hitCount[area] = (hitCount[area] || 0) + 1;
    }
  }

  const results = [];
  let id = 1;

  for (const area in ALL_LOCATIONS) {
    const { lat, lng } = ALL_LOCATIONS[area];
    const hits = hitCount[area] || 0;

    let status        = "Normal";
    let affectedUsers = 0;

    if (hits >= 5) {
      status        = "Outage";
      affectedUsers = hits * 20;
    } else if (hits >= 1) {
      status        = "Investigating";
      affectedUsers = hits * 20;
    }

    results.push({ id, area, lat, lng, status, affectedUsers });
    id++;
  }

  return results;
}

// ─────────────────────────────
// 🌐 API ENDPOINT
// ─────────────────────────────
router.get("/", (req, res) => {
  res.json(buildOutages());
});

module.exports = router;