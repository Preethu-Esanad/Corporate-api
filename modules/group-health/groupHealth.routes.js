const express = require("express");
const router = express.Router();
const controller = require("./groupHealth.controller");
const moduleAccess = require("../../middleware/moduleAccess");

router.post("/", moduleAccess(["groupHealth"], "create"), controller.create);
router.get("/", moduleAccess(["groupHealth"], "read"), controller.list);
router.get("/:id", moduleAccess(["groupHealth"], "read"), controller.getById);
router.put("/:id", moduleAccess(["groupHealth"], "update"), controller.update);
router.delete("/:id", moduleAccess(["groupHealth"], "delete"), controller.remove);

module.exports = router;
