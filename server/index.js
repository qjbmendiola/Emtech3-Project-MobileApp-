const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Import Routes
const routerRoute = require("./routes/router");
const chatRoute   = require("./routes/chat");
const authRoute   = require("./routes/auth"); // ✅ ADD AUTH

// Use Routes
app.use("/api/router", routerRoute);
app.use("/api/chat",   chatRoute);
app.use("/api",        authRoute); // ✅ LOGIN + SIGNUP

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server (IMPORTANT FIX FOR EXPO)
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});