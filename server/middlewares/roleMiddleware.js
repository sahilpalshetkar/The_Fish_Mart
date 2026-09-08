import User from "../models/user.model.js";

export const allowRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (error) {
      return res.status(500).json(`role middleware error ${error}`);
    }
  };
};
