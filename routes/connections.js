const express = require("express");
const router = express.Router();
const connectionsController = require("../controllers/connections");
const { ensureAuth } = require("../middleware/auth");

//Connections Route
router.get("/connections", ensureAuth, connectionsController.getConnection);

module.exports = router;
