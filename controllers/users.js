const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");
const User = require("../models/User");
const Chat = require("../models/Chat");

module.exports = {
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      return user;
    } catch (err) {
      console.log("Error fetching user:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  getFoodPreferences: async (req, res) => {
    try {
      const foodPreferences = await FoodPreference.find();
      return foodPreferences.map((e) => e.foodPreference);
    } catch (err) {
      console.log("Error fetching preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  getInterest: async (req, res) => {
    try {
      const interests = await Interest.find();
      return interests.map((e) => e.interest);
    } catch (err) {
      console.log("Error fetching preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  patchPreferences: async (req, res) => {
    try {
      const userId = req.user.id;
      let { foodPreferences, interests } = req.body;
      if (!foodPreferences) {
        foodPreferences = [];
      }
      if (!interests) {
        interests = [];
      }
      const userChats = await User.findById(userId).lean();
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            preferences: {
              interests: interests,
              foodPreferences: foodPreferences,
            },
          },
        },
        { new: true }
      );
      await Chat.updateMany(
        { members: userId },
        {
          $addToSet: {
            foodPreferences: { $each: [...foodPreferences] },
            interests: { $each: [...interests] },
          },
        },
        { new: true }
      );
      if (userChats.chatIds) {
        res.redirect("/profile");
      } else {
        res.redirect("/chat/createChat");
      }
    } catch (err) {
      console.log("Error patching preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
};
