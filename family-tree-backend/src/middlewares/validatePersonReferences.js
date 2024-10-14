const Person = require("../models/Person");

// Middleware to validate that both husb and wife are valid Person references
const validatePersonReferences = async (req, res, next) => {
  const { husb, wife } = req.body;

  try {
    // Check if both husband and wife exist in the database
    const husbandExists = await Person.findById(husb);
    const wifeExists = await Person.findById(wife);

    if (!husbandExists || !wifeExists) {
      return res
        .status(400)
        .json({ message: "Invalid husband or wife Person ID" });
    }

    // If both are valid, proceed to the next middleware or route handler
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error during validation", error: err.message });
  }
};

module.exports = validatePersonReferences;
