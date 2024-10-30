const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");
const User = require("../models/User");

module.exports = {
  getPreferences: async (req, res) => {
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      const { preferences = { interests: [], foodPreferences: [] } } = req.body;
      res.render("preferences.ejs", {
        interests,
        foodPreferences,
        userInterests: preferences.interests,
        userFoodPreferences: preferences.foodPreferences,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log("Error fetching preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  /*
if new user (no chats/matched group), user should be taken to onboarding screen, else take user to profile
if new user (no chats/matched group), onboarding should take you to your profile, with matched group chat open, else take you to profile - no new chat
new chat should take existing user to new matched chat (for mvp) and to prompt('would you like to update any of your preferences before finding a new group?') -> if yes, take to onboarding->new chat, else take to new chat

when onboarding is submitted, you're patching user doc with new values for interest and foodPreferences & if (no existing chats) redirect to profile w new chat else profile no new chat
*/
  patchPreferences: async (req, res) => {
    try {
      const { userId } = req.params;
      const { preferences } = req.body;
      // Find the group and update the name
      await User.findByIdAndUpdate(userId, { preferences }, { new: true });
      console.log("Preferences have been updated!");
      res.redirect("/profile");
    } catch (err) {
      console.log("Error patching preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  deletePreferences: async (req, res) => {
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      res.render("preferences.ejs", {
        interests: interests,
        foodPreferences: foodPreferences,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log("Error deleting preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
};
