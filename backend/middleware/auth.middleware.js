const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * MiddleWare to authorize API requests
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - Next Function
 * @returns {Promise<Response<any, Record<string, any>>>}
 */

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Access denied, No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied, No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.userId = decoded.userId;

      req.user = {
        id: decoded.userId,
        username: decoded.username,
        email: user.email,
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired." });
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token." });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error("Authentication error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

function createToken(user) {
  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
}

async function refreshToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true
    });

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newToken = createToken(user);

    return newToken;
  } catch (error) {
    throw error;
  }
}

module.exports = { authenticate, createToken, refreshToken };
