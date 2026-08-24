const fs = require("fs");
const path = require("path");
const { BlobServiceClient, BlobSASPermissions } = require("@azure/storage-blob");
const environment = require("../utils/environment");

const connectionString = environment.azureUpload.connectionString;
if (!connectionString) {
  console.warn("WARNING: AZURE_STORAGE_CONNECTION_STRING is not configured!");
}
const blobServiceClient = connectionString ? BlobServiceClient.fromConnectionString(connectionString) : null;

function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Failed to delete local file: " + filePath, err.message);
  }
}

var CONTROL_CHARS_RE = new RegExp("[\\x00-\\x1f\\x7f-\\x9f\\ufffd]", "g");

function sanitizeBlobName(name) {
  var cleaned = String(name || "file").replace(/\\/g, "/");
  cleaned = cleaned.replace(/\s+/g, "-");
  cleaned = cleaned.replace(CONTROL_CHARS_RE, "");
  return cleaned;
}

async function getContainerClient() {
  const container = environment.azureUpload.container;
  if (!container) throw new Error("AZURE_DOC_CONTAINER is not configured");
  const containerClient = blobServiceClient.getContainerClient(container);
  try {
    await containerClient.createIfNotExists({ access: "blob" });
  } catch (err) {
    console.warn(`Could not verify or create container "${container}":`, err.message);
  }
  return containerClient;
}

function getBlobNameFromUrl(urlStr) {
  try {
    const urlObj = new URL(urlStr);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    return parts.slice(1).join("/");
  } catch (err) {
    return urlStr;
  }
}

const storageHelper = {
  /**
   * Uploads a Buffer or a local file path to Azure Blob Storage.
   * @param {Buffer|string} fileOrBuffer
   * @param {string} fileName
   * @param {string} [folder]
   */
  uploadFile: async (fileOrBuffer, fileName, folder = "uploads") => {
    const containerClient = await getContainerClient();
    const blobPath = sanitizeBlobName(`${folder}/${Date.now()}-${fileName}`);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const isPath = typeof fileOrBuffer === "string";
    try {
      if (Buffer.isBuffer(fileOrBuffer)) {
        await blockBlobClient.uploadData(fileOrBuffer);
      } else if (isPath) {
        await blockBlobClient.uploadFile(fileOrBuffer);
      } else {
        throw new Error("uploadFile expects a Buffer or a file path string");
      }
      return blockBlobClient.url;
    } finally {
      if (isPath) safeUnlink(fileOrBuffer);
    }
  },

  deleteFile: async (fileUrl) => {
    const containerClient = await getContainerClient();
    const blobName = sanitizeBlobName(getBlobNameFromUrl(fileUrl));
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  },

  getSignedUrl: async (fileUrl, expiresInSeconds = 900) => {
    const containerClient = await getContainerClient();
    const blobName = sanitizeBlobName(getBlobNameFromUrl(fileUrl));
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(Date.now() + expiresInSeconds * 1000),
    });
  },
};

module.exports = storageHelper;
