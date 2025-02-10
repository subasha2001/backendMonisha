const { verify } = require("jsonwebtoken");
const { HTTP_UNAUTHORIZED } = require("../constants/http_status");
const { UserModel } = require("../models/userModel");

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(HTTP_UNAUTHORIZED).send({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedUser = verify(token, process.env.JWT_SECRET);
    req.user = decodedUser;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(HTTP_UNAUTHORIZED).send({ message: "Unauthorized: Invalid token" });
  }
};

const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to authorize admin
const authorizeAdmin = async (req, res, next) => {
  console.log(req.params.id);
  const user = await UserModel.findById(req.params.id);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = { authenticateToken, authorizeAdmin };