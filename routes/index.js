const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ success: true, message: "corporate-api is running" }));

router.use("/api/auth", require("./api/auth"));
router.use("/api/modules", require("./api/modules"));

module.exports = router;
