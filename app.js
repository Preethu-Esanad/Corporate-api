const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const database = require("./utils/database");

const app = express();
app.set("trust proxy", 1);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

database.connect();

app.use("/", indexRouter);

app.use((req, res, next) => next(createError(404)));
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ success: false, message: err.message });
});

module.exports = app;
