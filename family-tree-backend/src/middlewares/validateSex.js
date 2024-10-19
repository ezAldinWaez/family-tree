// Middleware to validate the 'sex' field
const validateSex = (req, res, next) => {
  const { sex } = req.body;
  const allowedValues = ["male", "female"];

  if (!allowedValues.includes(sex)) {
    return res
      .status(400)
      .json({ message: "Invalid sex. Allowed values are 'male' or 'female'." });
  }

  next();
};

module.exports = validateSex;
