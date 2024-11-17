// Validation middleware
const validateSpouseData = (req, res, next) => {
  const { personId, spouse, relationship } = req.body;

  if (!personId || !spouse || !relationship) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
  }

  // Required spouse fields
  const requiredSpouseFields = ["fullName", "sex"];
  const missingSpouseFields = requiredSpouseFields.filter(
    (field) => !spouse[field]
  );

  if (missingSpouseFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required spouse fields: ${missingSpouseFields.join(
        ", "
      )}`,
    });
  }

  // Validate relationship state
  const validStates = ["married", "divorced", "widowed"];
  if (relationship.state && !validStates.includes(relationship.state)) {
    return res.status(400).json({
      success: false,
      error: "Invalid relationship state",
    });
  }

  next();
};

module.exports = validateSpouseData;
