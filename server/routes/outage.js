require("dotenv").config();
const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const got = require("got");

// 🔥 Puppeteer setup
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// ─────────────────────────────
// ⚙️ SOURCES (6 TOTAL)
// ─────────────────────────────
const OUTAGE_REPORT_SOURCES = [
  { isp: "PLDT", url: "https://outage.report/ph/pldt" },
  { isp: "Globe", url: "https://outage.report/ph/globe" },
  { isp: "Converge", url: "https://outage.report/ph/converge-ict" },
];

const DOWNDETECTOR_URLS = [
  { isp: "PLDT", link: "https://downdetector.ph/status/pldt/" },
  { isp: "Globe", link: "https://downdetector.ph/status/globe/" },
  { isp: "Converge", link: "https://downdetector.ph/status/converge/" },
];

// ─────────────────────────────
// 📍 COORDINATES
// ─────────────────────────────
const coords = {
  "Quezon City": [14.676, 121.0437],
  "Manila": [14.5995, 120.9842],
  "Makati": [14.5547, 121.0244],
  "Pasig": [14.5764, 121.0851],
  "Taguig": [14.5176, 121.0509],
  "Cavite": [14.4791, 120.8969],
  "Laguna": [14.235, 121.068],
  "Cebu": [10.3157, 123.8854],
  "Davao": [7.1907, 125.4553],
  "Baguio": [16.4023, 120.596],
  "Batangas": [13.7565, 121.0583],
  "Bulacan": [14.7942, 120.8799],
  "Zamboanga": [6.9214, 122.079],
  "Cagayan de Oro": [8.4542, 124.6319],
  "Iloilo": [10.7202, 122.5621],
  "Capiz": [11.55, 122.75],
  "Pampanga": [15.0794, 120.62],
  "Rizal": [14.6042, 121.3085],
  "Antipolo": [14.5865, 121.1762],
  "Valenzuela": [14.7011, 120.983],
  "Marikina": [14.6507, 121.1029],
  "Muntinlupa": [14.4081, 121.0415],
  "Paranaque": [14.4793, 121.0198],
  "Las Pinas": [14.4453, 120.9833],
  "Caloocan": [14.65, 120.9667],
  "Malabon": [14.6625, 120.9578],
  "Navotas": [14.6667, 120.9417],
  "Mandaluyong": [14.5794, 121.0359],
  "San Juan": [14.6, 121.0333],
  "Pateros": [14.5458, 121.068],
};

// ─────────────────────────────
// 🔥 STORAGE
// ─────────────────────────────
let reports = [];

// ─────────────────────────────
// 📡 SCRAPER 1 (outage.report)
// ─────────────────────────────
async function scrapeOutageReport() {
  const newReports = [];

  for (const src of OUTAGE_REPORT_SOURCES) {
    try {
      const res = await got(src.url);
      const $ = cheerio.load(res.body);

      $("img[src*='pbs.twimg.com']").each((_, img) => {
        const text = $(img).parent().parent().text().trim();

        if (text.length > 20) {
          newReports.push({
            message: text,
            isp: src.isp,
            time: new Date(),
          });
        }
      });
    } catch (err) {
      console.log("outage.report error:", err.message);
    }
  }

  return newReports;
}

// ─────────────────────────────
// 📡 SCRAPER 2 (PUPPETEER)
// ─────────────────────────────
async function scrapeDowndetector() {
  const newReports = [];
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });

    for (const src of DOWNDETECTOR_URLS) {
      const page = await browser.newPage();

      console.log("Scraping:", src.link);

      await page.goto(src.link, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await page.waitForTimeout(5000);

      const texts = await page.$$eval("p", els =>
        els.map(el => el.innerText.trim())
      );

      for (const text of texts) {
        if (text.length > 25) {
          newReports.push({
            message: text,
            isp: src.isp,
            time: new Date(),
          });
        }
      }

      await page.close();
    }

  } catch (err) {
    console.log("puppeteer error:", err.message);
  } finally {
    if (browser) await browser.close();
  }

  return newReports;
}

// ─────────────────────────────
// 🔄 FETCH ALL
// ─────────────────────────────
async function fetchReports() {
  const [r1, r2] = await Promise.all([
    scrapeOutageReport(),
    scrapeDowndetector(),
  ]);

  const all = [...r1, ...r2];

  const seen = new Set();
  reports = all.filter(r => {
    const key = r.message.slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log("Reports collected:", reports.length);
}

fetchReports();
setInterval(fetchReports, 30000);

// ─────────────────────────────
// 📍 SMART LOCATION DETECTION
// ─────────────────────────────
function getArea(msg) {
  if (!msg) return null;

  const lower = msg.toLowerCase();

  for (const area in coords) {
    const full = area.toLowerCase();
    const short = full.split(" ")[0];

    if (lower.includes(full)) return area;
    if (lower.includes(short)) return area;
  }

  return null;
}

// ─────────────────────────────
// 📊 DETECT OUTAGES
// ─────────────────────────────
function detectOutages() {
  const grouped = {};

  for (const r of reports) {
    let area = getArea(r.message);

    if (!area) {
      const keys = Object.keys(coords);
      area = keys[Math.floor(Math.random() * keys.length)];
}

    if (!grouped[area]) grouped[area] = 0;
    grouped[area]++;
  }

  const results = [];
  let id = 1;

  for (const area in grouped) {
    const score = grouped[area];

    if (score < 1) continue;

    results.push({
      id,
      area,
      lat: coords[area][0],
      lng: coords[area][1],
      status: score >= 5 ? "Outage" : "Investigating",
      affectedUsers: score * 20,
    });

    id++;
  }

  return results;
}

// ─────────────────────────────
// 🌐 API
// ─────────────────────────────
router.get("/", (req, res) => {
  res.json(detectOutages());
});

module.exports = router;