const mongoose = require("mongoose");

// ── Schema for a single furniture piece ──────────────────────────────────────
const FurnitureSchema = new mongoose.Schema({
  uid:      { type: String, required: true },
  label:    { type: String, required: true },
  icon:     { type: String },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  size: {
    w: { type: Number, required: true },
    h: { type: Number, required: true },
  },
  positionFt: {
    x: { type: Number },
    y: { type: Number },
  },
});

// ── Schema for a saved room design ───────────────────────────────────────────
const DesignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "My Room Design",
      trim: true,
    },
    room: {
      length: { type: Number, required: true, min: 5, max: 30 },
      width:  { type: Number, required: true, min: 5, max: 30 },
    },
    furniture: [FurnitureSchema],
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Design", DesignSchema);
