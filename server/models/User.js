const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName:  { type: String },
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  accountNumber: { type: String, default: null },
}, { timestamps: true });

// ✅ FIX HERE
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);