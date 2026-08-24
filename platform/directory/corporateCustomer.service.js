const CorporateCustomerModel = require("../../models/corporateCustomer.model");

exports.create = (data) => CorporateCustomerModel.create(data);

exports.list = (filter = {}) =>
  CorporateCustomerModel.find({ isDeleted: false, ...filter }).sort({ createdAt: -1 });

exports.getById = (id) => CorporateCustomerModel.findOne({ _id: id, isDeleted: false });

exports.update = (id, data) =>
  CorporateCustomerModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });

exports.softDelete = (id) =>
  CorporateCustomerModel.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
