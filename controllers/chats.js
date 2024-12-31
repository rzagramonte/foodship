const cloudinary = require("../middleware/cloudinary");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

module.exports = {
  getChats: async (req, res) => {
    try {
      const chats = await Chat.find({ members: req.user.id }).populate({
        path: "members",
        select: "userName _id preferences",
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
  postChat: (io) => async (req, res) => {
    try {
      const user = req.user;
      const chatMatch = await Chat.findOne({
        $and: [
          // Ensures less than 6 members
          { $expr: { $lt: [{ $size: "$members" }, 6] } },
          { members: { $ne: user.id } },
          { foodPreferences: { $in: user.preferences.foodPreferences } },
          { interests: { $in: user.preferences.interests } },
        ],
      }).sort({ matchScore: -1 });
      if (chatMatch && chatMatch.members.length <= 6) {
        // Add the userId to the members array
        //push the chatId into the users chatIds
        chatMatch.members.push(user.id);
        // Save the updated chat document
        await chatMatch.save();
        await User.findByIdAndUpdate(user.id, { $push: { chatIds: chatMatch.id } });
        const systemMessage = await Message.create({
          chatId: chatMatch.id,
          content: `${user.userName} has joined the group.`,
          contentType: "text",
        });
        await Chat.findByIdAndUpdate(chatMatch.id, {
          $push: { messages: systemMessage },
        });
        
        console.log("User has been added to the chat!");
        res.status(201).json({chatMatch, systemMessage, userName: user.userName});
      } else {
        const chat = await Chat.create({
          members: [user.id],
          foodPreferences: user.preferences.foodPreferences,
          interests: user.preferences.interests,
        });
        await User.findByIdAndUpdate(user.id, { $push: { chatIds: chat.id } });
        console.log("Chat has been created!");
        res.status(201).json(chat);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error updating group name", err });
    }
  },
  patchGroupName: (io) => async (req, res) => {
    try {
      const chatId = req.params.id;
      const { groupName } = req.body;
      //console.log(groupName)
      await Chat.findByIdAndUpdate(
        chatId,
        { groupName, groupNameSet: true },
        { new: true }
      ); // Find the group and update the name
      console.log("Group name has been updated!");
      res.status(201).json(groupName);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error updating group name", err });
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
