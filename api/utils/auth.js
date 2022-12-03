import { createError } from "./error.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(createError(401, "login to access this resource"));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(
          403,
          `Role: ${req.user.role} is not allowed to access this resource`
        )
      );
    }
    next();
  };
};
