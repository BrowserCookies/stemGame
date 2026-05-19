import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  // Support "Bearer <token>"
  const token = authHeader.split(" ")[1] || authHeader;

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};
