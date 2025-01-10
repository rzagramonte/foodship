const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const { ensureAuth } = require("../middleware/auth");

//Main Routes
router.patch("/update/:id", ensureAuth, userController.patchPreferences);

module.exports = router;
