const cloudinary = require("../middleware/cloudinary");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

module.exports = {
  getChats: async (req, res) => {
    try {
      const chats = await Chat.find({ members: req.user._id }).populate({ path: "members", select: "userName _id preferences" });
      return chats;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error getting all user chats", err });
    }
  },
  postChat: (io) => async (req, res) => {
    try {
      const { user } = req;
      const chatMatch =
        (await Chat.findOne({
          $and: [
            // Ensures less than 6 members
            { $expr: { $lt: [{ $size: "$members" }, 6] } },
            { members: { $ne: user._id } },
            { cuisines: { $in: user.preferences.cuisines } },
            { interests: { $in: user.preferences.interests } },
          ],
        }).sort({ matchScore: -1 })) ||
        (await Chat.create({
          cuisines: user.preferences.cuisines,
          interests: user.preferences.interests,
        }));

      const systemMessage = await Message.create({
        chatId: chatMatch._id,
        content: `${user.userName} joined the group.`,
        contentType: "text",
      });

      await Chat.findByIdAndUpdate(chatMatch._id, {
        $addToSet: { members: user._id },
        $push: { messages: systemMessage._id },
      });
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { chatIds: chatMatch._id },
      });
      console.log("User has been added to the chat!");
      res.status(201).json({ chatMatch, systemMessage, userName: user.userName, userId: user.id });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error adding user to chat or creating new chat", err });
    }
  },
  patchGroupName: (io) => async (req, res) => {
    try {
      const chatId = req.params.id;
      const { groupName } = req.body;
      await Chat.findByIdAndUpdate(chatId, { groupName, groupNameSet: true }, { new: true }); // Find the group and update the name
//brian changed the channel name: Group Night 9/15/22 — 9/15/22, 8:42 PM

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
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path);
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
  deleteChat: (io) => async (req, res) => {
    try {
      const chatId = req.params.id;
      const { user } = req;
      const chat = await Chat.findById(chatId);
      const chatLength = chat.members.length;
      if (chatLength && chatLength > 1) {
        const deletedChat = await Chat.findByIdAndUpdate(chatId, {
          $pull: { members: user._id },
        });
        await User.findByIdAndUpdate(user._id, { $pull: { chatIds: chatId } });
        const systemMessage = await Message.create({
          chatId: deletedChat.id,
          content: `${user.userName} left the group.`,
          contentType: "text",
        });
        await Chat.findByIdAndUpdate(deletedChat._id, {
          $push: { messages: systemMessage },
        });
        res.status(200).json({ deletedChat, systemMessage, userName: user.userName, userId: user._id });
        console.log("User has been removed from chat!");
      } else {
        const picMessages = await Message.find({
          chatId,
          contentType: "image",
        });
        const imageDeletionPromises = picMessages.map((message) => cloudinary.uploader.destroy(message.cloudinaryId));
        await Promise.all(imageDeletionPromises);
        await Message.deleteMany({ chatId });
        await Chat.findByIdAndDelete(chatId);
        await User.findByIdAndUpdate(user._id, { $pull: { chatIds: chatId } });
        res.status(200).json({ message: "Chat has been deleted!" });
        console.log("Chat has been deleted!");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error removing user and/or deleting chat", err });
    }
  },
};
