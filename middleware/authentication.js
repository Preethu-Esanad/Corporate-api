const jwt = require("jsonwebtoken");
const environment = require("../utils/environment");
const UserModel = require("../models/user.model");
const { sendErrorResponse } = require("../utils/response");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization || "";
    const token = (authHeader && authHeader.split(" ")[1]) || req.cookies?.["token"] || req.query?.token;

    if (!token) {
      return sendErrorResponse(res, "Unauthorized Access: No token provided", 401, true, true);
    }

    const verified = await new Promise((resolve, reject) => {
      jwt.verify(token, environment.jwt.secret, (err, payload) => {
        if (err) reject(err);
        else resolve(payload);
      });
    });

    const dbUser = await UserModel.findById(verified._id);
    if (!dbUser || dbUser.isBlock || dbUser.isDeleted || !dbUser.isActive) {
      return sendErrorResponse(res, "Unauthorized Access: User account deactivated or not found", 401, true, true);
    }

    req.user = {
      ...verified,
      fullName: dbUser.fullName,
      email: dbUser.email,
      role: dbUser.role,
    };

    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError" || /jwt expired/i.test(error?.message || "")) {
      console.warn("Auth Middleware: jwt expired");
    } else {
      console.error("Auth Middleware Error:", error.message);
    }
    sendErrorResponse(res, `Unauthorized Access: ${error.message}`, 401, true, true);
  }
};
