const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

//////////////////////////////////////////////////////////
// 🔐 SIGNUP
//////////////////////////////////////////////////////////
router.post("/signup", async (req, res) => {
  try {
    // ✅ TRIM ALL INPUTS
    const surname = req.body.surname?.trim();
    const firstName = req.body.firstName?.trim();
    const middleInitial = req.body.middleInitial?.trim() || "";
    const email = req.body.email?.trim();
    const mobileNumber = req.body.mobileNumber?.trim();
    const accountNumber = req.body.accountNumber?.trim();
    const username = req.body.username?.trim();
    const password = req.body.password;

    // ✅ REQUIRED CHECK
    if (
      !surname ||
      !firstName ||
      !email ||
      !mobileNumber ||
      !accountNumber ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ VALIDATION
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    if (accountNumber.length !== 12) {
      return res.status(400).json({
        message: "Account number must be exactly 12 digits",
      });
    }

    // ✅ CHECK EXISTING USERS
    if (await User.findOne({ email })) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    if (await User.findOne({ username })) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER
    const user = await User.create({
      surname,
      firstName,
      middleInitial,
      email,
      mobileNumber,
      accountNumber,
      username,
      password: hashedPassword,
    });

    // ✅ TOKEN
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user,
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

//////////////////////////////////////////////////////////
// 🔐 LOGIN
//////////////////////////////////////////////////////////
router.post("/login", async (req, res) => {
  try {
    // ✅ TRIM INPUT
    const usernameInput = req.body.username?.trim();
    const password = req.body.password;

    if (!usernameInput || !password) {
      return res.status(400).json({
        message: "Missing credentials",
      });
    }

    // ✅ FIND USER (EMAIL OR USERNAME)
    const user = await User.findOne({
      $or: [
        { username: usernameInput },
        { email: usernameInput },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid login",
      });
    }

    // ✅ CHECK PASSWORD
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid login",
      });
    }

    // ✅ TOKEN
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      user,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;