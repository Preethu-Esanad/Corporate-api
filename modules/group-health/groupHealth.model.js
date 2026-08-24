const mongoose = require("mongoose");
const groupHealthConfig = require("./groupHealth.config");

const Schema = mongoose.Schema;

const GroupHealthSchema = new Schema(
  {
    corporateCustomerId: { type: Schema.Types.ObjectId, ref: "corporate_customer", required: true },
    status: { type: String, enum: groupHealthConfig.statuses, default: "draft" },
    census: [
      {
        employeeName: { type: String },
        emiratesId: { type: String },
        dateOfBirth: { type: Date },
        category: { type: String, enum: groupHealthConfig.categories },
      },
    ],
    planPreferences: { type: Object, default: {} },
    documents: [
      {
        docType: { type: String, enum: groupHealthConfig.docTypes },
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comparisonPdfUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GroupHealthSchema.index({ corporateCustomerId: 1, status: 1 });

module.exports = mongoose.model("group_health", GroupHealthSchema);
