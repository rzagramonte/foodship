const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { getLogin, postLogin, logout, getSignup, postSignup } = require("../controllers/auth");
const { getIndex, getAbout, getLearn, getSafety } = require("../controllers/home");

//Main Routes
router.get("/", getIndex);
router.get("/about", getAbout);
router.get("/learn", getLearn);
router.get("/safety", getSafety);

//Routes for user login/signup
router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/logout", ensureAuth, logout);
router.get("/signup", getSignup);
router.post("/signup", postSignup);

module.exports = router;
