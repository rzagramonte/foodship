const { getChats } = require("./chats");
const { getMessages } = require("./messages");
const { getUser, getCuisines, getInterests } = require("./users");
const { getEvents } = require("./events");

const fetchProfileData = async (req, res) => {
  const [chats, cuisines, interests, user] = await Promise.all([getChats(req, res), getCuisines(req, res), getInterests(req, res), getUser(req, res)]);
  return { chats, cuisines, interests, user };
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
      const [profileData, chat, events] = await Promise.all([fetchProfileData(req, res), getMessages(req, res), getEvents(req,res)]);
      const profile = {
        ...profileData,
        chat,
        events,
        landingPage: false,
      };
      res.render("profile.ejs", profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error loading profile data with chat" });
    }
  },
};
