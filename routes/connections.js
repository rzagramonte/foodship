const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { getConnection } = require("../controllers/connections");

//Connections Route
router.get("/connections", ensureAuth, getConnection);

module.exports = router;
