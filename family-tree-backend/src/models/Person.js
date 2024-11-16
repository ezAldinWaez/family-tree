const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  sex: { type: String, enum: ["male", "female"], required: true },
  birth: {
    date: { type: Date },
    place: { type: String },
  },
  isDead: { type: Boolean, required: true, default: false },
  death: {
    date: { type: Date },
    place: { type: String },
  },
  contact: {
    currentAddress: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", index: true },
  relationships: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Relationship", index: true },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Person", personSchema);
