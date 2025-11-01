const { body } = require("express-validator");

const loginValidation = [
  body("email").isEmail().withMessage("Email is not valid").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = loginValidation;
