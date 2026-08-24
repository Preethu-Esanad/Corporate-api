const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { sendErrorResponse } = require("../utils/response");

const mimeTypes = (mediaType) => {
  switch (mediaType) {
    case "image":
      return ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/svg+xml"];
    case "pdf":
      return ["application/pdf"];
    case "excel":
      return [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
    case "word":
      return [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
    default:
      return [];
  }
};

const getTempDir = (subdir = "corporate-api-uploads") => {
  const dir = path.join(os.tmpdir(), subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const dest = (uploadPath) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, getTempDir(`corporate-api-uploads/${uploadPath}`)),
    filename: (req, file, cb) => {
      const safeName = String(file.originalname || "file").replace(/ +/g, "_");
      cb(null, `${Date.now()}-${file.fieldname || "file"}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
    },
  });

const fileFilter = (mimeTypeArray) => {
  const allowedMimes = mimeTypeArray.map((m) => mimeTypes(m)).flat();
  return (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileValidationError = "Invalid file type";
      cb(null, false);
    }
  };
};

const wrapUpload = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return sendErrorResponse(res, "File too large. Maximum allowed size is 25MB.", 400, true, true);
      }
      return sendErrorResponse(res, err.message, 400, true, true);
    }
    if (req.fileValidationError) {
      return sendErrorResponse(res, req.fileValidationError, 400, true, true);
    }
    next();
  });
};

/**
 * fileUpload('logos', ["image"], [{ name: "logo", maxCount: 1 }])
 * Controller must upload the temp file to Azure Blob (helpers/storage.helper) then unlink it.
 */
exports.fileUpload = (destination, mimeTypesArray, fields) => {
  const upload = multer({
    storage: dest(destination),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: fileFilter(mimeTypesArray),
  }).fields(fields);
  return wrapUpload(upload);
};

/** In-memory upload (req.files[*].buffer) — controller uploads the buffer directly. */
exports.memoryUpload = (mimeTypesArray, fields) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: fileFilter(mimeTypesArray),
  }).fields(fields);
  return wrapUpload(upload);
};

exports.getTempDir = getTempDir;
