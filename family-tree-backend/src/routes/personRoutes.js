const express = require("express");
const Person = require("../models/Person");
const router = express.Router();
const validateSex = require('../middlewares/validateSex');
const validateAge = require('../middlewares/validateAge');
const validateFullName = require('../middlewares/validateFullName');

// Get all persons
router.get("/", async (req, res) => {
  try {
    const persons = await Person.find()
      .populate("relationships")
      .populate("origin");
    res.json(persons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a person by ID
router.get("/:id", async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate("relationships")
      .populate("origin");
    if (!person) return res.status(404).json({ message: "Person not found" });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new person
router.post("/", validateFullName, validateSex, validateAge, async (req, res) => {
  try {
    const person = new Person(req.body);
    const newPerson = await person.save();
    res.status(201).json(newPerson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a person by ID
router.put("/:id", validateFullName, validateSex, validateAge, async (req, res) => {
  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPerson)
      return res.status(404).json({ message: "Person not found" });
    res.json(updatedPerson);
  } catch (err) {
    res.status(400).json({ message: err.message }); // ? Why 400 and not 500 error message?
  }
});

// Delete a person by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(req.params.id);
    if (!deletedPerson)
      return res.status(404).json({ message: "Person not found" });
    res.json({ message: "Person deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
