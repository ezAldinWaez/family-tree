const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  sex: { type: String, enum: ["male", "female"], required: true },
  birthDate: { type: Date },
  birthPlace: { type: String },
  currentAddress: { type: String },
  isDead: { type: Boolean, required: true, default: false },
  deathDate: { type: Date },
  deathPlace: { type: String },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship" },
  relationships: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Relationship" },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Person", personSchema);
