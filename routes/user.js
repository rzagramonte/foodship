const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const { ensureAuth } = require("../middleware/auth");

//Main Routes
router.get("/:id", ensureAuth, userController.getPreferences);
router.patch("/update/:id", ensureAuth, userController.patchPreferences);
router.delete("/delete/:id", ensureAuth, userController.deletePreferences);

module.exports = router;
