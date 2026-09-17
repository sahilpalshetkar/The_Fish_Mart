import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodeToken?.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    req.userId = decodeToken.userId;

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication expired. Please sign in again",
      });
    }

    console.error("AUTH MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication service error",
    });
  }
};

export default isAuth;
