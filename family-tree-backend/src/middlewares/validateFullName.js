// Middleware to validate the 'fullName' field
const validateFullName = (req, res, next) => {
  const { fullName } = req.body;

  if (!fullName || fullName.trim() === "") {
    return res.status(400).json({ message: "Full name is required." });
  }

  // Optional: check for valid characters (letters and spaces)
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(fullName)) {
    return res
      .status(400)
      .json({ message: "Full name can only contain letters and spaces." });
  }

  next();
};

module.exports = validateFullName;
