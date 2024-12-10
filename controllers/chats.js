const cloudinary = require("../middleware/cloudinary");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

module.exports = {
  getChats: async (req, res) => {
    try {
      const chats = await Chat.find({ members: req.user.id }).populate({
        path: "members",
        select: "userName",
      });
      let chat;
      res.render("profile.ejs", {
        chats,
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
      const { id, preferences, userName } = req.user;
      const chats = await Chat.find({ members: req.user.id }).populate({
        path: "members",
        select: "userName",
        select: "preferences"
      });
      const chatMatch = await Chat.findOne({
        $and: [
          // Ensures less than 6 members
          { $expr: { $lt: [{ $size: "$members" }, 6] } },
          { members: { $ne: req.user.id } },
          { foodPreferences: { $in: preferences.foodPreferences } },
          { interests: { $in: preferences.interests } }
        ],
      }).sort({ matchScore: -1 });
      console.log(chatMatch)
      if (chatMatch && chatMatch.members.length <= 6) {
        // Add the userId to the members array
        chatMatch.members.push(id);
        // Save the updated chat document
        await chatMatch.save();
        console.log("User has been added to the chat!");
        res.redirect(`/messages/${chatMatch.id}`);
      } else {
        const chat = await Chat.create({
          members: [id],
          foodPreferences: preferences.foodPreferences,
          interests: preferences.interests,
        });
        await User.findByIdAndUpdate(id, { $push: { members: chat.id } });
        console.log("Chat has been created!");
        res.redirect(`/messages/${chat.id}`);
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
