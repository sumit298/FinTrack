const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const {
  createToken,
  refreshToken,
} = require("../middleware/auth.middleware");
const jwt = require('jsonwebtoken');

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

      await user.save();
      const token = createToken(user);

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
        return res
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

      const token = createToken(user);
      res.json({
        success: true,
        message: "User logged in successfully",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ message: "Server error during login", success: false });
    }
  },

  verifyToken: async (req, res) => {
    try {
      // If middleware passes, token is valid
      const user = await User.findById(req.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Token is valid",
        user: user.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Token verification failed",
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token not provided" });
      }

      // add a check to validate whether token is valid or not
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      const user = await User.findById(decoded.userId).select("-password");

      if(!user){
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      
      const newToken = await refreshToken(token);
      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        token: newToken,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token refresh failed",
        error: error.message,
      });
    }
  },
};

module.exports = AuthController;
