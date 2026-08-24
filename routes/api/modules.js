const express = require("express");
const router = express.Router();
const authentication = require("../../middleware/authentication");

router.use(authentication);

// Each product line under modules/ mounts its own router here.
router.use("/group-health", require("../../modules/group-health/groupHealth.routes"));

module.exports = router;
