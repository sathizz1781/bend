const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  email: { type: String },
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  locationUrl: { type: String },
  latitude: { type: Number, default: 11.31614508145554 },
  longitude: { type: Number, default: 77.75567293167116 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
