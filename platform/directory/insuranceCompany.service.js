const InsuranceCompanyModel = require("../../models/insuranceCompany.model");

exports.create = (data) => InsuranceCompanyModel.create(data);

exports.list = (filter = {}) =>
  InsuranceCompanyModel.find({ isDeleted: false, ...filter }).sort({ name: 1 });

exports.getById = (id) => InsuranceCompanyModel.findOne({ _id: id, isDeleted: false });

exports.listByCategory = (category) =>
  InsuranceCompanyModel.find({ categories: category, isActive: true, isDeleted: false });

exports.update = (id, data) =>
  InsuranceCompanyModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });

exports.softDelete = (id) =>
  InsuranceCompanyModel.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
