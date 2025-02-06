const Interest = require("../models/Interest");
const Cuisine = require("../models/Cuisine");
const User = require("../models/User");
const Chat = require("../models/Chat");

module.exports = {
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
  .populate({
    path: "preferences",
    populate: [
      { path: "cuisines", model: "Cuisine" },
      { path: "interests", model: "Interest" },
    ],
  });
      return user;
    } catch (err) {
      console.log("Error fetching user:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  getCuisines: async (req, res) => {
    try {
      const cuisines = await Cuisine.find();
      return cuisines;
    } catch (err) {
      console.log("Error fetching preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  getInterests: async (req, res) => {
    try {
      const interests = await Interest.find();
      return interests;
    } catch (err) {
      console.log("Error fetching preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
  patchPreferences: async (req, res) => {
    try {
      const userId = req.user.id;
      let { cuisines, interests } = req.body;
      if (!cuisines) {
        cuisines = [];
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
              interests,
              cuisines,
            },
          },
        },
        { new: true }
      );
      await Chat.updateMany(
        { members: userId },
        {
          $addToSet: {
            cuisines: cuisines,
            interests: interests,
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
