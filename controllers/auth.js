const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");

module.exports = {
  getLogin: (req, res) => {
    if (req.user) return res.redirect("/profile");
    res.render("login", {
      title: "Login",
      user: req.user,
      chats: false,
      landingPage: false,
    });
  },
  postLogin: (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: "Please enter a valid email address." });
    if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: "Password cannot be blank." });
    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/login");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });
  
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", info);
        return res.redirect("/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", { msg: "Success! You are logged in." });
        res.redirect(req.session.returnTo || "/profile");
      });
    })(req, res, next);
  },
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) next(err); // Handle any potential errors from req.logout()
  
      console.log("User has logged out.");
  
      // Destroy session only after successful logout
      req.session.destroy((err) => {
        if (err) {
          console.log("Error: Failed to destroy the session during logout.", err);
          return next(err); // Handle the session destroy error
        }
  
        req.user = null; // Ensure user is set to null after logout
        res.redirect("/"); // Redirect to the home page after logout
      });
    });
  },
  getSignup: (req, res) => {
    if (req.user) {
      return res.redirect("/profile");
    }
    res.render("signup", {
      user: req.user,
      title: "Create Account",
      chats: false,
      landingPage: false,
    });
  },
  postSignup: async (req, res, next) => {
    try {
      const validationErrors = [];
      if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: "Please enter a valid email address." });
      if (!validator.isLength(req.body.password, { min: 8 }))
        validationErrors.push({
          msg: "Password must be at least 8 characters long",
        });
      if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: "Passwords do not match" });
  
      if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("../signup");
      }
      req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false,
      });
  
      const user = new User({
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
      });
  
      const existingUser = await User.findOne({
        $or: [{ email: req.body.email }, { userName: req.body.userName }],
      });
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      const savedUser = await user.save();
  
      req.logIn(savedUser, (err) => {
        if (err) return next(err);
        if (savedUser) res.redirect(req.session.returnTo || "/profile");
      });
    } catch (err) {
      console.log(err);
    }
  }
}
