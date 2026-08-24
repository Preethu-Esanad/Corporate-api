const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InsuranceCompanySchema = new Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String, lowercase: true },
    phone: { type: String },
    /** Product lines this insurer underwrites, e.g. ["group-health", "motor-fleet"] */
    categories: [{ type: String }],
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

InsuranceCompanySchema.index({ name: "text" });
InsuranceCompanySchema.index({ categories: 1 });

module.exports = mongoose.model("insurance_company", InsuranceCompanySchema);
