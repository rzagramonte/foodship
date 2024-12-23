const Interest = require("../models/Interest");
const FoodPreference = require("../models/FoodPreference");
const User = require("../models/User");
const Chat = require("../models/Chat");

module.exports = {
  getPreferences: async (req, res) => {
    try {
      const interests = await Interest.find();
      const foodPreferences = await FoodPreference.find();
      const {userName} = req.user;
      const user = req.user
      const userId = req.params.id
      res.render("preferences.ejs", {
        foodPreferences,
        interests,
        user,
        userId,
        userName,
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
  // TODO: Handle edge case where food preferences are removed (e.g., pizza removed from all users)
  patchPreferences: async (req, res) => {
    try {
      const { id } = req.params;
      const { foodPreferences, interests } = req.body;
      const userChats = await User.findById(id).lean();
      // Find the group and update the name
      await User.findByIdAndUpdate(
        id,
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
        { members: id },
        {
          $addToSet: {
            foodPreferences: { $each: foodPreferences },
            interests: { $each: interests },
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
  //do i really need a delete preferences? - no
  //clears all preferences on user's acct
  putPreferences: async (req, res) => {
    const { id } = req.params;
    try {
      await User.findByIdAndUpdate(
        id,
        { $set: { preferences: { interests: [], foodPreferences: [] } } },
        { new: true } // Return the updated document
      );
      console.log("Preferences have been cleared!");
      res.redirect(`/user/${id}`);
    } catch (err) {
      console.log("Error deleting preferences:", err);
      res.status(500).send("Server error. Please try again later.");
    }
  },
};
