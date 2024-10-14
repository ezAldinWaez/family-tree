const mongoose = require("mongoose");

const relationshipSchema = new mongoose.Schema({
  husb: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  wife: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  state: {
    type: String,
    enum: ["married", "divorced", "widowed"],
    default: "married",
  },
  marriageStartDate: { type: Date },
  marriageStartPlace: { type: String },
  marriageEndDate: { type: Date },
  marriageEndPlace: { type: String },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
}, { timestamps: true });

module.exports = mongoose.model("Relationship", relationshipSchema);
