require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  server: process.env.SERVER_URL,
  database: { uri: process.env.DB_URI },
  jwt: { secret: process.env.JWT_SECRET, expiredIn: process.env.JWT_EXPIRED_IN || "7d" },
  anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    senderEmail: process.env.ADMIN_EMAIL,
    senderName: process.env.SENDER_NAME || "eSanad Corporate",
  },
  azureUpload: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    container: process.env.AZURE_DOC_CONTAINER,
  },
};
