// Middleware to validate birthDate and deathDate
const validateAge = (req, res, next) => {
  const { birthDate, deathDate } = req.body;

  // Check if birthDate is a valid date in the past
  if (birthDate && new Date(birthDate) > new Date()) {
    return res
      .status(400)
      .json({ message: "Birth date cannot be in the future." });
  }

  // If deathDate is provided, it should be after birthDate
  if (birthDate && deathDate && new Date(deathDate) < new Date(birthDate)) {
    return res
      .status(400)
      .json({ message: "Death date cannot be before birth date." });
  }

  next();
};

module.exports = validateAge;
