const mongoose = require("mongoose");
const { RELATIONSHIP_STATE } = require("../config/constants");

const relationshipSchema = new mongoose.Schema(
  {
    husb: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
      index: true,
    },
    wife: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
      index: true,
    },
    state: {
      type: String,
      enum: Object.values(RELATIONSHIP_STATE),
      default: RELATIONSHIP_STATE.MARRIED,
    },
    marriageInfo: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
    children: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Person", index: true },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Relationship", relationshipSchema);
