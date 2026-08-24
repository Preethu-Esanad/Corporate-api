const GroupHealthModel = require("./groupHealth.model");
const { sendSuccessResponse, sendErrorResponse } = require("../../utils/response");

exports.create = async (req, res) => {
  try {
    const record = await GroupHealthModel.create({ ...req.body, createdBy: req.user._id });
    return sendSuccessResponse(res, { record }, 201);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.list = async (req, res) => {
  try {
    const records = await GroupHealthModel.find({ isDeleted: false })
      .populate("corporateCustomerId", "companyName")
      .sort({ createdAt: -1 });
    return sendSuccessResponse(res, { records });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.getById = async (req, res) => {
  try {
    const record = await GroupHealthModel.findOne({ _id: req.params.id, isDeleted: false }).populate(
      "corporateCustomerId"
    );
    if (!record) return sendErrorResponse(res, "Record not found", 404, true, true);
    return sendSuccessResponse(res, { record });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const record = await GroupHealthModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true }
    );
    if (!record) return sendErrorResponse(res, "Record not found", 404, true, true);
    return sendSuccessResponse(res, { record });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

exports.remove = async (req, res) => {
  try {
    const record = await GroupHealthModel.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );
    if (!record) return sendErrorResponse(res, "Record not found", 404, true, true);
    return sendSuccessResponse(res, { message: "Record deleted" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
