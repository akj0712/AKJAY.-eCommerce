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

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        createError(404, "Reset Password Token is invalid or has been expired")
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(createError(400, "Password does not match"));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

//** get user details
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

//** update user
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatch = await user.comparePassword(req.body.oldpassword);

    if (!isPasswordMatch) {
      return next(createError(400, "old password password is incorrect"));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(createError(400, "password don't match"));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

//** update user profile
export const updateProfile = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  //profile pic
  try {
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

//** get all users(admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

//** get single users(admin)
export const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        createError(400, `user doesn't exit with id: ${req.params.id}`)
      );
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

//** update user role (admin)
export const updateUserRole = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  try {
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    if (!user) {
      return next(
        createError(400, `user doesn't exit with id: ${req.params.id}`)
      );
    }
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

//** delete user (admin)
export const deleteUser = async (req, res, next) => {
  //remove profilepic
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "user deleted successfully" });
  } catch (err) {
    next(err);
  }
};
