const cloudinary = require("../middleware/cloudinary");
const Chat = require("../models/Chat");

module.exports = {
  getChats: async (req, res) => {
    try {
      const chats = await Chat.find({ members: req.user.id });
      res.render("profile.ejs", {
        chats,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getChat: async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.id);
      res.render("chat.ejs", {
        chat,
        user: req.user,
        landingPage: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  postChat: async (req, res) => {
    try {
      const { interests, foodPreferences, userId } = req.body;
      //add the user interests and foodPreferences to the user doc as well
      const chatMatch = await Chat.findOne({
        $and: [
          { $expr: { $lt: [{ $size: "$members" }, 6] } }, // Ensures less than 6 members
          {
            members: {
              $elemMatch: {
                interests: { $in: interests }, // Matches at least one interest
                foodPreferences: { $in: foodPreferences }, // Matches at least one food preference
              },
            },
          },
        ],
      });
      if (chatMatch) {
        // Add the userId to the members array
        chatMatch.members.push(userId);
        // Save the updated chat document
        await chatMatch.save();
        console.log("User has been added to the chat!");
        res.redirect(`chat/${chatMatch._id}`);
      } else {
        await Chat.create({
          member: [userId],
          foodPreference: [...foodPreferences],
          interests: [...interests],
        });
        console.log("Chat has been created!");
        res.redirect(`chat/${chatMatch._id}`);
      }
    } catch (err) {
      console.log(err);
    }
  },
  patchGroupName: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { name } = req.body;
      // Find the group and update the name
      await Group.findByIdAndUpdate(chatId, { name }, { new: true });
      console.log("Chat name has been updated!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  patchGroupPic: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path
      );
      // Find the group and update the name
      await Chat.findByIdAndUpdate({
        chatId,
        secure_url,
        public_id,
      });
      console.log("Chat pic has been updated!");
      res.redirect("/chat");
    } catch (err) {
      console.log(err);
    }
  },
  deleteChat: async (req, res) => {
    try {
      const { chatId, userId } = req.params;
      await Chat.findByIdAndUpdate(
        { _id: chatId },
        { $pull: { user: userId } },
        { upsert: true }
      );
      console.log("Left chat :(");
      res.redirect(`/profile`);
    } catch (err) {
      console.log(err);
    }
  },
};
