const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CorporateCustomerSchema = new Schema(
  {
    companyName: { type: String, required: true },
    tradeLicenseNumber: { type: String },
    contactPerson: { type: String },
    email: { type: String, lowercase: true },
    phone: { type: String },
    address: { type: String },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CorporateCustomerSchema.index({ companyName: "text", tradeLicenseNumber: "text" });

module.exports = mongoose.model("corporate_customer", CorporateCustomerSchema);
