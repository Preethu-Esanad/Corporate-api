const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const environment = require("../utils/environment");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, mobileNumber, role } = req.body;
    if (!fullName || !email || !password) {
      return sendErrorResponse(res, "fullName, email and password are required", 400, true, true);
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendErrorResponse(res, "A user with this email already exists", 409, true, true);
    }

    const user = await UserModel.create({ fullName, email, password, mobileNumber, role });
    return sendSuccessResponse(res, { message: "User registered", userId: user._id }, 201);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendErrorResponse(res, "email and password are required", 400, true, true);
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || user.isBlock || user.isDeleted || !user.isActive) {
      return sendErrorResponse(res, "Invalid credentials", 401, true, true);
    }

    const isMatch = await new Promise((resolve, reject) => {
      user.comparePassword(password, (err, match) => (err ? reject(err) : resolve(match)));
    });
    if (!isMatch) {
      return sendErrorResponse(res, "Invalid credentials", 401, true, true);
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, environment.jwt.secret, {
      expiresIn: environment.jwt.expiredIn,
    });

    user.lastLoggedInAt = new Date();
    await user.save();

    return sendSuccessResponse(res, {
      token,
      user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.me = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) return sendErrorResponse(res, "User not found", 404, true, true);
    return sendSuccessResponse(res, { user });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
