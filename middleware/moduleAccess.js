const UserModel = require("../models/user.model");
const { roles } = require("../utils/constants");
const { sendErrorResponse } = require("../utils/response");

/**
 * moduleAccess(["groupHealth"], "read") — Admin always passes;
 * other roles need req.user.permissions[moduleName][actionType] === true.
 */
module.exports = (moduleNames, actionType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendErrorResponse(res, "User not authenticated or req.user missing", 403, true, true);
      }

      const { _id: userId, role } = req.user;
      if (role === roles.admin) return next();

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendErrorResponse(res, "User not found", 404, true, true);
      }

      const permissions = user.permissions || {};
      const hasAccess = moduleNames.some((modName) => {
        const mod = permissions[modName];
        return mod && mod[actionType];
      });

      if (hasAccess) return next();
      return sendErrorResponse(res, "You are not authorized to perform this operation", 403, true, true);
    } catch (error) {
      sendErrorResponse(res, error.message || "Forbidden", 403, true, true);
    }
  };
};
