const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const { createToken } = require("../middleware/auth.middleware");

const AuthController = {
  register: async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "validation failed for registration",
        });
      }
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User with username or email already exists",
          success: false,
        });
      }
      const user = new User({ username, email, password });
      // check if user already exists

      await user.save();
      const token = createToken(user._id);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Server error during registration", success: false });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ message: "validation failed for login", success: false });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid credentials", success: false });
      }

      //checking password
      const isMatched = await user.comparePassword(password);

      if (!isMatched) {
        return res
          .status(401)
          .json({ message: "Invalid credentials", success: false });
      }

      const token = createToken(user._id);
      res.json({
        success: true,
        message: "User logged in successfully",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error during login", success: false });
    }
  },
};

module.exports = AuthController;
