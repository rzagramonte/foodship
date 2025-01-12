const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { patchPreferences } = require("../controllers/users");

//Main Routes
router.patch("/update/:id", ensureAuth, patchPreferences);
module.exports = router;
