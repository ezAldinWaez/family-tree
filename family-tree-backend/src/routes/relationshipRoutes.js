const express = require("express");
const Relationship = require("../models/Relationship");
const router = express.Router();
const validatePersonReferences = require("../middlewares/validatePersonReferences");

// Get all relationships
router.get("/", async (req, res) => {
  try {
    const relationships = await Relationship.find()
      .populate("husb")
      .populate("wife")
      .populate("children");
    res.json(relationships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a relationship by ID
router.get("/:id", async (req, res) => {
  try {
    const relationship = await Relationship.findById(req.params.id)
      .populate("husb")
      .populate("wife")
      .populate("children");
    if (!relationship)
      return res.status(404).json({ message: "Relationship not found" });
    res.json(relationship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new relationship
router.post("/", validatePersonReferences, async (req, res) => {
  try {
    const relationship = new Relationship(req.body);
    const newRelationship = await relationship.save();
    res.status(201).json(newRelationship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a relationship by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedRelationship = await Relationship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRelationship)
      return res.status(404).json({ message: "Relationship not found" });
    res.json(updatedRelationship);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a relationship by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedRelationship = await Relationship.findByIdAndDelete(
      req.params.id
    );
    if (!deletedRelationship)
      return res.status(404).json({ message: "Relationship not found" });
    res.json({ message: "Relationship deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
