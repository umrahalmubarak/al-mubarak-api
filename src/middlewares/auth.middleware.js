import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";


export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // contains userId & role
    next();
    console.log("Decoded user role:", payload.role);

  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Role check middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("Allowed roles:", roles);
    console.log("User role:", req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};



