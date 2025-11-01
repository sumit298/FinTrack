const { body } = require("express-validator");

const registerValidation = [
  body("username")
    .trim()
    .isLength({ max: 30, min: 3 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

module.exports = registerValidation;
