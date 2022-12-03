import User from "../models/User.js";
import bcrypt from "bcrypt";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";

//** register a user
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "this is a sample id",
        url: "profilepicURL",
      },
    });

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

//** login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createError(400, "please enter email and password"));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(createError(401, "invalid email or password"));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(createError(401, "invalid email or password"));
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

//** logout
export const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

//** frogot password
export const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(createError(404, "user not found"));
  }

  // get reset password token
  const resetToken = await user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `AKJAY. password recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `email send to ${user.email} successfully`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(createError(500, err.message));
  }
};

//** reset password
export const resetPassword = async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
};
