import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "zentora_dev_secret_change_this";

// Verifies token, attaches decoded { id, type } to req.user
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ code: 401, success: false, message: "No token provided", result: "", error: true });
    }
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, type }
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, success: false, message: "Invalid or expired token", result: "", error: true });
  }
};

// Restrict route to specific role(s), e.g. allowRoles("admin") or allowRoles("client","admin")
export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.type)) {
    return res.status(403).json({ code: 403, success: false, message: "Access denied", result: "", error: true })
  }
  next();
}
