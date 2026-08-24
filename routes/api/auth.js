const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const authentication = require("../../middleware/authentication");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authentication, authController.me);

module.exports = router;
