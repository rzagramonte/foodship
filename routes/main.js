const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const chatsController = require("../controllers/chats");
const onboardingController = require("../controllers/onboarding");
const { ensureAuth } = require("../middleware/auth");

//Main Routes
router.get("/", homeController.getIndex);
router.get("/about", homeController.getAbout);
router.get("/learn", homeController.getLearn);
router.get("/safety", homeController.getSafety);
router.get("/onboarding", ensureAuth, onboardingController.getPreferences);
router.get("/profile", ensureAuth, chatsController.getChats);

//Routes for user login/signup
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
