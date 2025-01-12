const { getChats } = require("./chats");
const { getMessages } = require("./messages");
const { getUser, getFoodPreferences, getInterest } = require("./users");

// Helper function to fetch profile data
const fetchProfileData = async (req, res) => {
  const [chats, foodPreferences, interests, user] = await Promise.all([
    getChats(req, res), 
    getFoodPreferences(req, res),
    getInterest(req, res),
    getUser(req,res)
  ]);
  return { chats, foodPreferences, interests, user };
};

module.exports = {
  getProfile: async (req, res) => {
    try {
      // Use the helper function to get profile data
      const profile = await fetchProfileData(req,res);
      profile.chat = null;
      profile.landingPage = false;
      // Render profile page
      res.render("profile.ejs", profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error loading profile data", });
    }
  },

  getMessages: async (req, res) => {
    try {
      // Fetch profile data and messages concurrently
      const [profileData, chat] = await Promise.all([
        fetchProfileData(req,res),
        getMessages(req, res),
      ]);

      const profile = {
        ...profileData, // Spread the profile data
        chat,
        landingPage: false,
      };
      console.log(chat)
      // Render profile page with messages
      res.render("profile.ejs", profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error loading profile data" });
    }
  },
};
