const express = require("express");
const Person = require("../models/Person");
const Relationship = require("../models/Relationship");
const router = express.Router();

// Get Tree
router.get("/tree", async (req, res) => {
  try {
    const persons = (await Person.find()).map((p) => {
      return {
        id: p.id,
        fullName: p.fullName,
        sex: p.sex,
        birthYear: p.birthDate.getFullYear(),
        isDeaed: p.isDead.getFullYear(),
        deathYear: p.deathDate,
        relationships: p.relationships,
      };
    });
    const relationships = (await Relationship.find()).map((r) => {
      return {
        id: r.id,
        husb: r.husb,
        wife: r.wife,
        state: r.state,
        children: r.children,
      };
    });
    res.json({
      persons: persons,
      relationships: relationships,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/person", async (req, res) => {
  try {
    const person = new Person({
      fullName: req.body.fullName,
      sex: req.body.sex,
      isDead: req.body.isDead ?? false,
      ...(req.body.birthDate && { birthDate: req.body.birthDate }),
      ...(req.body.birthPlace && { birthDate: req.body.birthPlace }),
      ...(req.body.currentAddress && { birthDate: req.body.currentAddress }),

    });
    const newPerson = await person.save();
    res.status(201).json(newPerson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
