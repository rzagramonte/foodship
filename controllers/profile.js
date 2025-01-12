const { getChats } = require("./chats");
const { getMessages } = require("./messages");
const { getUser, getFoodPreferences, getInterest } = require("./users");

const fetchProfileData = async (req, res) => {
  const [chats, foodPreferences, interests, user] = await Promise.all([getChats(req, res), getFoodPreferences(req, res), getInterest(req, res), getUser(req, res)]);
  return { chats, foodPreferences, interests, user };
};

module.exports = {
  getProfile: async (req, res) => {
    try {
      const profile = await fetchProfileData(req, res);
      profile.chat = null;
      profile.landingPage = false;
      res.render("profile.ejs", profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error loading profile data" });
    }
  },

  getMessages: async (req, res) => {
    try {
      const [profileData, chat] = await Promise.all([fetchProfileData(req, res), getMessages(req, res)]);
      const profile = {
        ...profileData,
        chat,
        landingPage: false,
      };
      res.render("profile.ejs", profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error loading profile data" });
    }
  },
};
