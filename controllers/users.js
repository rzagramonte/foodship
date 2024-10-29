const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");
const User = require("../models/User");

module.exports = {
  /*
if new user (no chats/matched group), user should be taken to onboarding screen, else take user to profile
if new user (no chats/matched group), onboarding should take you to your profile, with matched group chat open, else take you to profile - no new chat
new chat should take existing user to new matched chat (for mvp) and to prompt('would you like to update any of your preferences before finding a new group?') -> if yes, take to onboarding->new chat, else take to new chat

when onboarding is submitted, you're patching user doc with new values for interest and foodPreferences & if (no existing chats) redirect to profile w new chat else profile no new chat
*/
  getPreferences: async (req, res) => {
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", {
        interests: interests,
        foodPreferences: foodPreferences,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getUserPreferences: async (req, res) => {
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", {
        interests: interests,
        foodPreferences: foodPreferences,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  patchPreferences: async (req, res) => {
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", {
        interests: interests,
        foodPreferences: foodPreferences,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  patchPreferences: async (req, res) => {
    try {
      const user = await User.find({ user: req.user.id });
      const interests = await Interest.find({ user: req.user.id });
      const foodPreferences = await FoodPreference.find();
      res.render("profile.ejs", {
        interests: interests,
        foodPreferences: foodPreferences,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  deletePreferences: async (req, res) => {
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("onboarding.ejs", {
        interests: interests,
        foodPreferences: foodPreferences,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
};
