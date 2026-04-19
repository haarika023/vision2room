const express = require("express");
const router  = express.Router();
const Design  = require("../models/Design");

// ── GET /api/designs ─────────────────────────────────────────────────────────
// Returns all saved designs, newest first
router.get("/", async (req, res) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch designs", details: err.message });
  }
});

// ── GET /api/designs/:id ─────────────────────────────────────────────────────
// Returns a single design by its MongoDB _id
router.get("/:id", async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: "Design not found" });
    res.json(design);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch design", details: err.message });
  }
});

// ── POST /api/designs ────────────────────────────────────────────────────────
// Creates and saves a new design
router.post("/", async (req, res) => {
  try {
    const { name, room, furniture } = req.body;

    // Basic validation
    if (!room || !room.length || !room.width) {
      return res.status(400).json({ error: "Room dimensions are required" });
    }

    const design = new Design({ name, room, furniture });
    const saved  = await design.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to save design", details: err.message });
  }
});

// ── PUT /api/designs/:id ─────────────────────────────────────────────────────
// Updates an existing design (e.g. move furniture and re-save)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Design.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Design not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update design", details: err.message });
  }
});

// ── DELETE /api/designs/:id ──────────────────────────────────────────────────
// Deletes a saved design
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Design.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Design not found" });
    res.json({ message: "Design deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete design", details: err.message });
  }
});

module.exports = router;
