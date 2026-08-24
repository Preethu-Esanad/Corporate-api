const mongoose = require("mongoose");
const constants = require("./constants");
const environment = require("./environment");

const DB = environment.database.uri;
const connection = mongoose.connection;

const connect = () => {
  mongoose.connect(DB, constants.database.options).catch((err) => {
    console.error("MongoDB initial connection failed, retrying in 5s:", err.message);
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) connect();
    }, 5000);
  });
};

connection
  .on("connected", () => {
    console.log("Database connected");
  })
  .on("disconnected", () => {
    console.log("Database disconnected");
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) connect();
    }, 5000);
  })
  .on("error", (err) => {
    console.error("Database error:", err.message);
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) connect();
    }, 5000);
  });

process.on("SIGINT", () => {
  connection
    .close()
    .then(() => process.exit(0))
    .catch((err) => console.error("Error closing database connection", err));
});

module.exports = { connect };
