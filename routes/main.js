const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const groupChatsController = require("../controllers/groupChats");
const safetyController = require("../controllers/safety");
const learnController = require("../controllers/learn");
const supportController = require("../controllers/support");
const settingsController = require("../controllers/settings");
const { ensureAuth } = require("../middleware/auth");

//Main Routes 
router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, groupChatsController.getGroupChats);
router.get("/safety", safetyController.getSafety);
/*
router.get("/learn", learnController.getLearn);
router.get("/support", supportController.getSafety);
router.get("/settings", ensureAuth, settingsController.getSettings);
router.put("/settings", ensureAuth, settingsController.updateSettings);
*/
//Routes for user login/signup
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);


module.exports = router;
