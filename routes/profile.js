const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { getProfile } = require("../controllers/profile");

// Define the route for the profile page
router.get("/", ensureAuth, getProfile);

module.exports = router;
