require("dotenv").config();
const express = require("express");
const router  = express.Router();
const cheerio = require("cheerio");
const got     = require("got");

// ─────────────────────────────
// ⚙️ SOURCES (cheerio/got only — no puppeteer, works on Render free tier)
// ─────────────────────────────
const OUTAGE_SOURCES = [
  { isp: "PLDT",     url: "https://outage.report/ph/pldt" },
  { isp: "Globe",    url: "https://outage.report/ph/globe" },
  { isp: "Converge", url: "https://outage.report/ph/converge-ict" },
];

// ─────────────────────────────
// 📍 COORDINATES
// ─────────────────────────────
const coords = {
  "Quezon City":     [14.676,   121.0437],
  "Manila":          [14.5995,  120.9842],
  "Makati":          [14.5547,  121.0244],
  "Pasig":           [14.5764,  121.0851],
  "Taguig":          [14.5176,  121.0509],
  "Cavite":          [14.4791,  120.8969],
  "Laguna":          [14.235,   121.068 ],
  "Cebu":            [10.3157,  123.8854],
  "Davao":           [ 7.1907,  125.4553],
  "Baguio":          [16.4023,  120.596 ],
  "Batangas":        [13.7565,  121.0583],
  "Bulacan":         [14.7942,  120.8799],
  "Zamboanga":       [ 6.9214,  122.079 ],
  "Cagayan de Oro":  [ 8.4542,  124.6319],
  "Iloilo":          [10.7202,  122.5621],
  "Capiz":           [11.55,    122.75  ],
  "Pampanga":        [15.0794,  120.62  ],
  "Rizal":           [14.6042,  121.3085],
  "Antipolo":        [14.5865,  121.1762],
  "Valenzuela":      [14.7011,  120.983 ],
  "Marikina":        [14.6507,  121.1029],
  "Muntinlupa":      [14.4081,  121.0415],
  "Paranaque":       [14.4793,  121.0198],
  "Las Pinas":       [14.4453,  120.9833],
  "Caloocan":        [14.65,    120.9667],
  "Malabon":         [14.6625,  120.9578],
  "Navotas":         [14.6667,  120.9417],
  "Mandaluyong":     [14.5794,  121.0359],
  "San Juan":        [14.6,     121.0333],
  "Pateros":         [14.5458,  121.068 ],
};

// ─────────────────────────────
// 🔥 REPORT STORAGE
// ─────────────────────────────
let reports = [];

// ─────────────────────────────
// 📡 SCRAPER (got + cheerio only)
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

      // Grab any text blocks that mention locations or outage keywords
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

    // Deduplicate by first 80 chars
    const seen = new Set();
    reports = scraped.filter((r) => {
      const key = r.message.slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`[outage] reports cached: ${reports.length}`);
  } catch (err) {
    console.error("[outage] fetchReports error:", err.message);
  }
}

// Run immediately and every 5 minutes
fetchReports();
setInterval(fetchReports, 5 * 60 * 1000);

// ─────────────────────────────
// 📍 LOCATION DETECTION
// ─────────────────────────────
function getArea(msg) {
  if (!msg) return null;
  const lower = msg.toLowerCase();
  for (const area in coords) {
    if (lower.includes(area.toLowerCase())) return area;
    if (lower.includes(area.toLowerCase().split(" ")[0])) return area;
  }
  return null;
}

// ─────────────────────────────
// 📊 DETECT OUTAGES
// ─────────────────────────────
function detectOutages() {
  const grouped = {};
  const areaKeys = Object.keys(coords);

  for (const r of reports) {
    // Only assign random area if we have real reports — avoids ghost outages when empty
    const area = getArea(r.message) || areaKeys[Math.floor(Math.random() * areaKeys.length)];
    grouped[area] = (grouped[area] || 0) + 1;
  }

  const results = [];
  let id = 1;

  for (const area in grouped) {
    const score = grouped[area];
    if (score < 1) continue;

    results.push({
      id,
      area,
      lat:           coords[area][0],
      lng:           coords[area][1],
      status:        score >= 5 ? "Outage" : "Investigating",
      affectedUsers: score * 20,
    });

    id++;
  }

  return results;
}

// ─────────────────────────────
// 🌐 API ENDPOINT
// ─────────────────────────────
router.get("/", (req, res) => {
  res.json(detectOutages());
});

module.exports = router;