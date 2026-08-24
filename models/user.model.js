const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const constants = require("../utils/constants");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobileNumber: { type: String },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: constants.user.roles,
      default: constants.roles.user,
    },
    /** moduleName -> { create, read, update, delete } — read by middleware/moduleAccess.js */
    permissions: { type: Object, default: {} },
    isBlock: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoggedInAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (plainPassword, next) {
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => next(err, isMatch));
};

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
