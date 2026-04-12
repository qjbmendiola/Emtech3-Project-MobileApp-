const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ─────────────────────────────
// 🔧 Middleware
// ─────────────────────────────
app.use(cors());
app.use(express.json());

// ─────────────────────────────
// 🗄 MongoDB Connection
// ─────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ─────────────────────────────
// 📦 Import Routes
// ─────────────────────────────
const routerRoute = require("./routes/router");
const chatRoute   = require("./routes/chat");
const authRoute   = require("./routes/auth");
const outageRoute = require("./routes/outage");

// ─────────────────────────────
// 🚀 Use Routes
// ─────────────────────────────
app.use("/api/router", routerRoute);
app.use("/api/chat",   chatRoute);
app.use("/api",        authRoute);
app.use("/api/outage", outageRoute);

// ─────────────────────────────
// 🧪 Health check route
// ─────────────────────────────
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/ping", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─────────────────────────────
// 💓 Keep-alive: ping self every 14 minutes
// Prevents Render free tier from sleeping
// ─────────────────────────────
const RENDER_URL = process.env.RENDER_URL || "";

if (RENDER_URL) {
  setInterval(async () => {
    try {
      const res = await fetch(`${RENDER_URL}/ping`);
      console.log(`[keep-alive] ping → ${res.status}`);
    } catch (err) {
      console.warn("[keep-alive] ping failed:", err.message);
    }
  }, 14 * 60 * 1000); // every 14 minutes
}

// ─────────────────────────────
// ▶️ Start Server
// ─────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});